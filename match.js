'use strict'

const {cpus: osCpus} = require('os')
const movingAvg = require('live-moving-average')
const pLimit = require('p-limit')
const {
	createMatchTrip,
	createMatchMovement,
	close,
} = require('match-gtfs-rt-to-gtfs')
const {pipeline} = require('stream')
const {parse, stringify} = require('ndjson')
const {transform: parallelTransform} = require('parallel-stream')
const createLogger = require('./lib/logger')
const {POSITION, TRIP} = require('./lib/protocol')

const logger = createLogger('match')

const onError = (err) => {
	logger.error(err)
	process.exit(1)
}

const runGtfsMatching = (gtfsRtInfo, gtfsInfo, opt = {}) => {
	const {
		matchTripTimeout,
		matchMovementTimeout,
		matchConcurrency,
	} = {
		matchTripTimeout: process.env.MATCH_TRIP_TIMEOUT
			? parseInt(process.env.MATCH_TRIP_TIMEOUT)
			: 10 * 1000, // 10s
		matchMovementTimeout: process.env.MATCH_MOVEMENT_TIMEOUT
			? parseInt(process.env.MATCH_MOVEMENT_TIMEOUT)
			: 10 * 1000, // 10s
		matchConcurrency: process.env.MATCH_CONCURRENCY
			? parseInt(process.env.MATCH_CONCURRENCY)
			// todo: this makes assumptions about how PostgreSQL scales
			: osCpus().length + 1,
		...opt,
	}

	const matchTripWithGtfs = createMatchTrip(gtfsRtInfo, gtfsInfo)
	const matchMovementWithGtfs = createMatchMovement(gtfsRtInfo, gtfsInfo)

	let items = 0
	let matchedItems = 0
	let cancelledMatches = 0
	const avgWaitTime = movingAvg(100, 0)
	const avgMatchTime = movingAvg(100, 0)
	const seenTripIds = new Set()
	const matchedTripIds = new Set()

	const limit = pLimit(matchConcurrency)

	// todo: DRY with matchMovement
	const matchTrip = async (trip) => {
		items++
		const origTripId = trip.id
		seenTripIds.add(origTripId)

		// Promises returned by p-limit are not cancelable yet, but we can
		// hack around this here.
		// see also sindresorhus/p-limit#25
		let cancelled = false
		const timeout = setTimeout(() => {
			cancelled = true
			cancelledMatches++
		}, matchTripTimeout)

		const t0 = Date.now()
		await limit(async () => {
			if (cancelled) return;
			clearTimeout(timeout)

			const t1 = Date.now()
			trip = await matchTripWithGtfs(trip)
			const t2 = Date.now()

			const isMatched = trip.ids && trip.ids[gtfsInfo.endpointName]
			logger.debug({
				origTripId,
				isMatched, matchTime: t2 - t1, waitTime: t1 - t0,
			}, [
				isMatched ? 'matched' : 'failed to match',
				'trip in', t2 - t1,
				'after', t1 - t0, 'waiting',
			].join(' '))
			avgMatchTime.push(t2 - t1)
			avgWaitTime.push(t1 - t0)
			if (isMatched) {
				matchedItems++
				matchedTripIds.add(origTripId)
			}
		})

		return trip
	}

	// todo: DRY with matchTrip
	const matchMovement = async (mv) => {
		items++
		const origTripId = mv.tripId
		seenTripIds.add(origTripId)

		// Promises returned by p-limit are not cancelable yet, but we can
		// hack around this here.
		// see also sindresorhus/p-limit#25
		let cancelled = false
		const timeout = setTimeout(() => {
			cancelled = true
			cancelledMatches++
		}, matchMovementTimeout)

		const t0 = Date.now()
		await limit(async () => {
			if (cancelled) return;
			clearTimeout(timeout)

			const t1 = Date.now()
			mv = await matchMovementWithGtfs(mv)
			const t2 = Date.now()

			const isMatched = mv.tripIds && mv.tripIds[gtfsInfo.endpointName]
			logger.debug({
				origTripId,
				isMatched, matchTime: t2 - t1, waitTime: t1 - t0,
			}, [
				isMatched ? 'matched' : 'failed to match',
				'movement in', t2 - t1,
				'after', t1 - t0, 'waiting',
			].join(' '))
			avgMatchTime.push(t2 - t1)
			avgWaitTime.push(t1 - t0)
			if (isMatched) {
				matchedItems++
				matchedTripIds.add(origTripId)
			}
		})

		return mv
	}

	// todo: DRY this with monitor.js & serve.js
	const transform = (item, _, cb) => {
		if (item[0] === POSITION) {
			const movement = item[2]

			matchMovement(movement)
			.then(movement => cb(null, [POSITION, item[1], movement]))
			// If matching failed, we still pass on the movement.
			.catch((err) => {
				logger.error(err)
				cb(null, [POSITION, item[1], movement])
			})
			.catch(cb)
		} else if (item[0] === TRIP) {
			const trip = item[1]

			matchTrip(trip)
			.then(trip => cb(null, [TRIP, trip]))
			// If matching failed, we still pass on the trip.
			.catch((err) => {
				logger.error(err)
				cb(null, [TRIP, trip])
			})
			.catch(cb)
		} else {
			cb(null, item)
		}
	}

	const reportStats = () => {
		logger.info({
			items,
			matchedItems,
			cancelledMatches,
			avgMatchTime: avgMatchTime.get(),
			avgWaitTime: avgWaitTime.get(),
			seenTripIds: seenTripIds.size,
			matchedTripIds: matchedTripIds.size,
		})
	}

	const statsInterval = setInterval(reportStats, 5000)

	pipeline(
		process.stdin,
		parse(),
		parallelTransform(transform, {
			objectMode: true,
			concurrency: matchConcurrency * 2, // todo
		}),
		stringify(),
		process.stdout,
		(err) => {
			if (err) onError(err)
			reportStats()
			clearInterval(statsInterval)
			close().catch(onError)
		},
	)
}

module.exports = runGtfsMatching
