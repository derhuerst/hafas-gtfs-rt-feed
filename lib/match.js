'use strict'

const {cpus: osCpus} = require('os')
const {Counter, Summary, Gauge} = require('prom-client')
const pLimit = require('p-limit')
const {
	createMatchTrip,
	createMatchMovement,
	close: closeMatching,
} = require('match-gtfs-rt-to-gtfs')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const findShape = require('match-gtfs-rt-to-gtfs/find-shape')
const createLogger = require('./logger')
const {createMetricsServer, register} = require('./metrics')
const setWithTtlAndCountMetric = require('./set-with-ttl')
const withSoftExit = require('./soft-exit')

const MAJOR_VERSION = require('./major-version')

const logger = createLogger('match')

const onError = (err) => {
	logger.error(err)
	process.exit(1)
}

const MATCHED = Symbol.for('match-gtfs-rt-to-gtfs:matched')
const CACHED = Symbol.for('match-gtfs-rt-to-gtfs:cached')

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
		matchConcurrency: process.env.MATCH_CONCURRENCY
			? parseInt(process.env.MATCH_CONCURRENCY)
			// todo: this makes assumptions about how PostgreSQL scales
			: osCpus().length,
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
	metricsServer.start().catch(onError)

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

	const matchTripWithGtfs = createMatchTrip(hafasInfo, gtfsInfo)
	const matchMovementWithGtfs = createMatchMovement(hafasInfo, gtfsInfo)

	const seenTripIds1m = {
		movement: setWithTtlAndCountMetric(60 * 1000, _seenTripIds1m, {kind: 'movement'}),
		trip: setWithTtlAndCountMetric(60 * 1000, _seenTripIds1m, {kind: 'trip'}),
	}
	const matchedTripIds1m = {
		movement: setWithTtlAndCountMetric(60 * 1000, _matchedTripIds1m, {kind: 'movement'}),
		trip: setWithTtlAndCountMetric(60 * 1000, _matchedTripIds1m, {kind: 'trip'}),
	}

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
				const t1 = Date.now()
				const waitTime = t1 - t0

				item = await _match(item)
				const matchTime = Date.now() - t1
				const isMatched = item[MATCHED] === true
				const isCached = item[CACHED] === true

				logger.debug({
					origTripId, isMatched, matchTime, waitTime,
				}, [
					isMatched ? 'matched' : 'failed to match',
					isCached ? 'from cache' : 'fresh',
					kind, 'in', matchTime, 'after', waitTime, 'waiting',
				].join(' '))
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
		const customMatchMovementWithGtfs = async (mv) => {
			mv = await beforeMatchMovement(mv)
			const matched = await matchMovementWithGtfs(mv)
			// We don't want to serialize the whole trip, but keep all GTFS-RT-
			// relevant fields. This is an ugly ad-hoc hack, there should be a
			// better way to solve this.
			if (matched.trip) {
				matched.tripOrigin = matched.trip.origin
				matched.tripPlannedDeparture = matched.trip.plannedDeparture
				matched.tripDestination = matched.trip.destination
				matched.tripPlannedArrival = matched.trip.plannedArrival
			}
			return matched
		}
		movSub.on('message', createMatch(
			'movement',
			matchedMovementsChannel,
			matchMovementTimeout,
			mv => mv.tripId,
			customMatchMovementWithGtfs,
		))

		const tripAckWait = matchTripTimeout * 1.1 + 1000 // todo
		const tripSubOpts = subOpts()
		.setAckWait(tripAckWait)
		.setDurableName(`v${MAJOR_VERSION}-${feedId}-movements`)
		const tripSub = natsStreaming.subscribe(tripsChannel, natsQueueGroup, tripSubOpts)
		const matchTripAndShapeWithGtfs = async (trip) => {
			trip = await beforeMatchTrip(trip)
			const matched = await matchTripWithGtfs(trip)
			if (
				!matchTripPolylines ||
				matched.polyline &&
				matched.polyline.features &&
				matched.polyline.features.length > 0
			) return matched

			const gtfsId = matched && matched.ids && matched.ids[gtfsInfo.endpointName]
			const shape = gtfsId && (await findShape(gtfsId))
			if (shape) {
				// transform to hafas-client FeatureCollection format 🙄
				// public-transport/hafas-client#217
				// todo: what if the HAFAS polylines are more exact?
				matched.polyline = {
					type: 'FeatureCollection',
					features: shape.coordinates.map(coordinates => ({
						type: 'Feature',
						properties: {},
						geometry: {type: 'Point', coordinates}
					})),
				}
			}
			return matched
		}
		tripSub.on('message', createMatch(
			'trip',
			matchedTripsChannel,
			matchTripTimeout,
			trip => trip.id,
			matchTripAndShapeWithGtfs,
		))

		// todo: handle errors
	})

	withSoftExit(() => {
		natsStreaming.close()
		closeMatching().catch(onError)
	})
}

module.exports = runGtfsMatching
