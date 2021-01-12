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

	let receivedItems = 0
	let matchedItems = 0
	let cancelledMatches = 0
	const avgWaitTime = movingAvg(100, 30) // past 100 items, pre-fill with 30ms
	const avgMatchTime = movingAvg(100, 30) // past 100 items, pre-fill with 30ms
	const seenTripIds = new Set()
	const matchedTripIds = new Set()

	const limit = pLimit(matchConcurrency)

	const natsStreaming = connectToNatsStreaming(natsClusterId, natsClientId, {
		url: natsStreamingUrl,
		name: natsClientName,
		maxPubAcksInflight: 300, // todo
	})
	const subOpts = () => {
		return natsStreaming.subscriptionOptions()
		.setMaxInFlight(matchConcurrency * 2) // todo
		.setManualAckMode(true)
	}

	const createMatch = (kind, timeout, tripId, _isMatched, _match) => {
		const waitAndMatch = (msg) => {
			let item = JSON.parse(msg.getData())
			receivedItems++

			const origTripId = tripId(tripId)
			seenTripIds.add(origTripId)

			// Promises returned by p-limit are not cancelable yet, but we can
			// hack around this here.
			// see also sindresorhus/p-limit#25
			let cancelled = false
			const cancelTimer = setTimeout(() => {
				cancelled = true
				cancelledMatches++
			}, timeout)

			const t0 = Date.now()
			const match = async () => {
				if (cancelled) return;
				clearTimeout(cancelTimer)
				const t1 = Date.now()
				const waitTime = t1 - t0

				item = await _match(item)
				const matchTime = Date.now() - t1
				const isMatched = _isMatched(item)

				logger.debug({
					origTripId, isMatched, matchTime, waitTime,
				}, [
					isMatched ? 'matched' : 'failed to match', kind,
					'in', matchTime, 'after', waitTime, 'waiting',
				].join(' '))
				avgMatchTime.push(matchTime)
				avgWaitTime.push(waitTime)
				if (isMatched) {
					matchedItems++
					matchedTripIds.add(origTripId)
				}
			}

			limit(match)
			.catch(err => logger.error(err))
			.then(() => {
				natsStreaming.publish(`matched-${kind}s`, JSON.stringify(item), (err) => {
					if (err) logger.error(err)
					else msg.ack()
				})
			})
		}
		return waitAndMatch
	}

	natsStreaming.once('connect', () => {
		const movAckWait = matchMovementTimeout * 1.1 + 1000 // todo
		const movSubOpts = subOpts().setAckWait(movAckWait)
		const movSub = natsStreaming.subscribe('movements', movSubOpts)
		movSub.on('message', createMatch(
			'movement',
			matchMovementTimeout,
			mv => mv.tripId,
			mv => !!(mv.tripIds && mv.tripIds[gtfsInfo.endpointName]),
			matchMovementWithGtfs,
		))

		const tripAckWait = matchTripTimeout * 1.1 + 1000 // todo
		const tripSubOpts = subOpts().setAckWait(tripAckWait)
		const tripSub = natsStreaming.subscribe('trips', tripSubOpts)
		tripSub.on('message', createMatch(
			'trip',
			matchTripTimeout,
			mv => mv.tripId,
			mv => !!(mv.tripIds && mv.tripIds[gtfsInfo.endpointName]),
			matchTripWithGtfs,
		))

		// todo: handle errors
	})

	const reportStats = () => {
		logger.info({
			receivedItems,
			matchedItems,
			cancelledMatches,
			avgMatchTime: avgMatchTime.get(),
			avgWaitTime: avgWaitTime.get(),
			seenTripIds: seenTripIds.size,
			matchedTripIds: matchedTripIds.size,
		})
	}
	const statsInterval = setInterval(reportStats, 5000)

	withSoftExit(() => {
		reportStats()
		clearInterval(statsInterval)
		natsStreaming.close()
		closeMatching().catch(onError)
	})
}

module.exports = runGtfsMatching
