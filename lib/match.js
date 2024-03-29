'use strict'

const {cpus: osCpus} = require('os')
const {Counter, Summary, Gauge} = require('prom-client')
const pLimit = require('p-limit')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const createLogger = require('./logger')
const {createMetricsServer, register} = require('./metrics')
const setWithTtlAndCountMetric = require('./set-with-ttl')
const {
	createMatchWithGtfs,
	closeMatching,
} = require('./raw-match')
const withSoftExit = require('./soft-exit')

const MAJOR_VERSION = require('./major-version')

const logger = createLogger('match')

const onError = (err) => {
	logger.error(err)
	process.exit(1)
}

const runGtfsMatching = (hafasInfo, gtfsInfo, opt = {}) => {
	const _natsId = Math.random().toString(16).slice(2, 6)
	const {
		feedId,
		matchTripTimeout,
		matchMovementTimeout,
		matchConcurrency,
		matchTripPolylines,
		natsStreamingUrl,
		natsClusterId,
		natsClientId,
		natsClientName,
		movementsChannel,
		tripsChannel,
		matchedMovementsChannel,
		matchedTripsChannel,
		beforeMatchTrip,
		beforeMatchMovement,
	} = {
		feedId: process.env.FEED_ID || _natsId,
		matchTripTimeout: process.env.MATCH_TRIP_TIMEOUT
			? parseInt(process.env.MATCH_TRIP_TIMEOUT)
			: 10 * 1000, // 10s
		matchMovementTimeout: process.env.MATCH_MOVEMENT_TIMEOUT
			? parseInt(process.env.MATCH_MOVEMENT_TIMEOUT)
			: 10 * 1000, // 10s
		// todo [breaking]: rename to MATCH_GTFS_RT_TO_GTFS_CONCURRENCY?
		matchConcurrency: process.env.MATCH_CONCURRENCY
			? parseInt(process.env.MATCH_CONCURRENCY)
			// this makes assumptions about how PostgreSQL scales
			// todo: query the *PostgreSQL server's* nr of cores, instead of the machine's that hafas-gtfs-rt-feed runs on
			// todo: match-gtfs-rt-to-gtfs uses pg.Pool, which has a max connection limit, so this option here is a bit useless...
			// but it seems there's no clean way to determine this
			//     CREATE TEMPORARY TABLE cpu_cores (num_cores integer);
			//     COPY cpu_cores (num_cores) FROM PROGRAM 'sysctl -n hw.ncpu';
			//     SELECT num_cores FROM cpu_cores LIMIT 1
			: osCpus().length + 1,
		matchTripPolylines: process.env.MATCH_TRIP_POLYLINES === 'true',
		natsStreamingUrl: process.env.NATS_STREAMING_URL || 'nats://localhost:4222',
		natsClusterId: process.env.NATS_CLUSTER_ID || 'test-cluster',
		natsClientId: process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-match-${_natsId}`,
		natsClientName: process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-match`,
		movementsChannel: process.env.MOVEMENTS_CHANNEL || 'movements',
		tripsChannel: process.env.TRIPS_CHANNEL || 'trips',
		matchedMovementsChannel: process.env.MATCHED_MOVEMENTS_CHANNEL || 'matched-movements',
		matchedTripsChannel: process.env.MATCHED_TRIPS_CHANNEL || 'matched-trips',
		beforeMatchTrip: trip => trip,
		beforeMatchMovement: mv => mv,
		...opt,
	}

	const metricsServer = createMetricsServer()
	metricsServer.start()
	.then(
		() => {
			logger.info(`serving Prometheus metrics on port ${metricsServer.address().port}`)
		},
		onError,
	)

	const natsStreamingReceivedTotal = new Counter({
		name: 'nats_streaming_received_total',
		help: 'nr. of messages received from NATS streaming',
		registers: [register],
		labelNames: ['channel'],
	})
	const natsStreamingSentTotal = new Counter({
		name: 'nats_streaming_sent_total',
		help: 'nr. of messages published to NATS streaming',
		registers: [register],
		labelNames: ['channel'],
	})
	const natsStreamingErrorsTotal = new Counter({
		name: 'nats_streaming_errors_total',
		help: 'nr. of failures publishing to NATS streaming',
		registers: [register],
		labelNames: ['channel'],
	})
	// todo [breaking]: add 'success' label, use also for failed matchings?
	const matchedTotal = new Counter({
		name: 'matched_total',
		help: 'nr. of successfully matched movements/trips',
		registers: [register],
		labelNames: ['kind', 'cached'],
	})
	const cancelledQueuedTotal = new Counter({
		name: 'cancelled_queued_total',
		help: 'nr. of queued-to-be-matched movements/trips that got cancelled',
		registers: [register],
		labelNames: ['kind'],
	})
	const matchQueueWaitTime = new Summary({
		name: 'match_queue_wait_time_seconds',
		help: 'seconds items are queued for before matching',
		registers: [register],
		labelNames: ['kind'],
	})
	const matchTimeSeconds = new Summary({
		name: 'match_time_seconds',
		help: 'seconds items need to be matched',
		registers: [register],
		labelNames: ['kind'],
	})
	const _seenTripIds1m = new Gauge({
		name: 'seen_trip_ids_1m',
		help: 'nr. of trip IDs seen within the last minute',
		registers: [register],
		labelNames: ['kind'],
	})
	const _matchedTripIds1m = new Gauge({
		name: 'matched_trip_ids_1m',
		help: 'nr. of matched trip IDs within the last minute',
		registers: [register],
		labelNames: ['kind'],
	})

	const {
		matchMovementWithGtfs,
		matchTripWithGtfs,
	} = createMatchWithGtfs({
		hafasInfo, gtfsInfo,
		beforeMatchTrip, beforeMatchMovement,
		matchTripPolylines,
		logger,
	})

	const seenTripIds1m = {
		movement: setWithTtlAndCountMetric(60 * 1000, _seenTripIds1m, {kind: 'movement'}),
		trip: setWithTtlAndCountMetric(60 * 1000, _seenTripIds1m, {kind: 'trip'}),
	}
	const matchedTripIds1m = {
		movement: setWithTtlAndCountMetric(60 * 1000, _matchedTripIds1m, {kind: 'movement'}),
		trip: setWithTtlAndCountMetric(60 * 1000, _matchedTripIds1m, {kind: 'trip'}),
	}

	// todo: use NATS JetStream
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
	const natsQueueGroup = 'match'

	const limit = pLimit(matchConcurrency)
	const createMatch = (kind, natsChannel, timeout, tripId, _match) => {
		const waitAndMatch = (msg) => {
			let item = JSON.parse(msg.getData())
			natsStreamingReceivedTotal.inc({channel: natsChannel})

			const origTripId = tripId(item)
			seenTripIds1m[kind].push(origTripId)

			// Promises returned by p-limit are not cancelable yet, but we can
			// hack around this here.
			// see also sindresorhus/p-limit#25
			let cancelled = false
			const cancelTimer = setTimeout(() => {
				cancelled = true
				cancelledQueuedTotal.inc({kind})
			}, timeout)

			const t0 = Date.now()
			const match = async () => {
				if (cancelled) return;
				clearTimeout(cancelTimer)
				const waitTime = Date.now() - t0

				const res = await _match(item, waitTime)
				item = res.item
				const {isMatched, isCached, matchTime} = res

				matchQueueWaitTime.observe({kind}, waitTime / 1000)
				matchTimeSeconds.observe({kind}, matchTime / 1000)
				if (isMatched) {
					matchedTotal.inc({kind, cached: isCached})
					matchedTripIds1m[kind].push(origTripId)
				}
			}

			limit(match)
			.catch(err => logger.error(err))
			.then(() => {
				natsStreaming.publish(natsChannel, JSON.stringify(item), (err) => {
					if (err) {
						natsStreamingErrorsTotal.inc({channel: natsChannel})
						logger.error(err)
					} else {
						natsStreamingSentTotal.inc({channel: natsChannel})
						msg.ack()
					}
				})
			})
		}
		return waitAndMatch
	}

	natsStreaming.once('connect', () => {
		const movAckWait = matchMovementTimeout * 1.1 + 1000 // todo
		const movSubOpts = subOpts()
		.setAckWait(movAckWait)
		.setDurableName(`v${MAJOR_VERSION}-${feedId}-movements`)
		const movSub = natsStreaming.subscribe(movementsChannel, natsQueueGroup, movSubOpts)
		movSub.on('message', createMatch(
			'movement',
			matchedMovementsChannel,
			matchMovementTimeout,
			mv => mv.tripId,
			matchMovementWithGtfs,
		))

		const tripAckWait = matchTripTimeout * 1.1 + 1000 // todo
		const tripSubOpts = subOpts()
		.setAckWait(tripAckWait)
		.setDurableName(`v${MAJOR_VERSION}-${feedId}-movements`)
		const tripSub = natsStreaming.subscribe(tripsChannel, natsQueueGroup, tripSubOpts)
		tripSub.on('message', createMatch(
			'trip',
			matchedTripsChannel,
			matchTripTimeout,
			trip => trip.id,
			matchTripWithGtfs,
		))

		// todo: handle errors
	})

	withSoftExit(() => {
		natsStreaming.close()
		closeMatching().catch(onError)
	})
}

module.exports = runGtfsMatching
