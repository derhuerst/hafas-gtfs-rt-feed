'use strict'

const {cpus: osCpus} = require('os')
const movingAvg = require('live-moving-average')
const pLimit = require('p-limit')
const {
	createMatchTrip,
	createMatchMovement,
	close: closeMatching,
} = require('match-gtfs-rt-to-gtfs')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const createLogger = require('./lib/logger')
const withSoftExit = require('./lib/soft-exit')

const MAJOR_VERSION = require('./lib/major-version')

const logger = createLogger('match')

const onError = (err) => {
	logger.error(err)
	process.exit(1)
}

const runGtfsMatching = (gtfsRtInfo, gtfsInfo, opt = {}) => {
	const clientId = Math.random().toString(16).slice(2, 6)
	const {
		matchTripTimeout,
		matchMovementTimeout,
		matchConcurrency,
		natsStreamingUrl,
		natsClusterId,
		natsClientId,
		natsClientName,
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
		natsStreamingUrl: process.env.NATS_STREAMING_URL || 'nats://localhost:4222',
		natsClusterId: process.env.NATS_CLUSTER_ID || 'test-cluster',
		natsClientId: process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-match-${clientId}`,
		natsClientName: process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-match`,
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

	const natsStreaming = connectToNatsStreaming(natsClusterId, natsClientId, {
		url: natsStreamingUrl,
		name: natsClientName,
		maxPubAcksInflight: matchConcurrency * 2, // todo
	})
	const subOpts = () => {
		return natsStreaming.subscriptionOptions()
		.setMaxInFlight(matchConcurrency * 2) // todo
		.setManualAckMode(true)
	}

	const matcher = (match, pubChannel) => (msg) => {
		const onPublish = (err) => {
			if (err) logger.error(err)
			else msg.ack()
		}

		const unmatched = JSON.parse(msg.getData())
		match(unmatched)
		.then((matched) => {
			natsStreaming.publish(
				pubChannel,
				JSON.stringify(matched),
				onPublish,
			)
		}, (err) => {
			logger.error(err)
			natsStreaming.publish(
				pubChannel,
				JSON.stringify(unmatched),
				onPublish,
			)
		})
		.catch(logger.error)
	}

	natsStreaming.once('connect', () => {
		const posAckWait = matchTripTimeout * 1.1 + 1000 // todo
		const posSubOpts = subOpts().setAckWait(posAckWait)
		const posSub = natsStreaming.subscribe('positions', posSubOpts)
		posSub.on('message', matcher(matchMovement, 'matched-positions'))

		const tripsAckWait = matchTripTimeout * 1.1 + 1000 // todo
		const tripsSubOpts = subOpts().setAckWait(tripsAckWait)
		const tripsSub = natsStreaming.subscribe('trips', tripsSubOpts)
		tripsSub.on('message', matcher(matchMovement, 'matched-trips'))

		// todo: handle errors
	})

	const statsInterval = setInterval(reportStats, 5000)

	withSoftExit(() => {
		reportStats()
		clearInterval(statsInterval)
		natsStreaming.close()
		closeMatching().catch(onError)
	})
}

module.exports = runGtfsMatching
