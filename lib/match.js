'use strict'

const {cpus: osCpus} = require('os')
const speedometer = require('speedometer')
const movingAvg = require('live-moving-average')
const pLimit = require('p-limit')
const {
	createMatchTrip,
	createMatchMovement,
	close: closeMatching,
} = require('match-gtfs-rt-to-gtfs')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const findShape = require('match-gtfs-rt-to-gtfs/find-shape')
const createLogger = require('./logger')
const withSoftExit = require('./soft-exit')

const MAJOR_VERSION = require('./major-version')

const logger = createLogger('match')

const onError = (err) => {
	logger.error(err)
	process.exit(1)
}

const runGtfsMatching = (hafasInfo, gtfsInfo, opt = {}) => {
	const clientId = Math.random().toString(16).slice(2, 6)
	const {
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
		matchTripPolylines: process.env.MATCH_TRIP_POLYLINES === 'true',
		natsStreamingUrl: process.env.NATS_STREAMING_URL || 'nats://localhost:4222',
		natsClusterId: process.env.NATS_CLUSTER_ID || 'test-cluster',
		natsClientId: process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-match-${clientId}`,
		natsClientName: process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-match`,
		movementsChannel: process.env.MOVEMENTS_CHANNEL || 'movements',
		tripsChannel: process.env.TRIPS_CHANNEL || 'trips',
		matchedMovementsChannel: process.env.MATCHED_MOVEMENTS_CHANNEL || 'matched-movements',
		matchedTripsChannel: process.env.MATCHED_TRIPS_CHANNEL || 'matched-trips',
		...opt,
	}

	const matchTripWithGtfs = createMatchTrip(hafasInfo, gtfsInfo)
	const matchMovementWithGtfs = createMatchMovement(hafasInfo, gtfsInfo)

	const receivedItems = {total: 0, movement: 0, trip: 0}
	const matchedItems = {total: 0, movement: 0, trip: 0}
	const matchedItemsRate = speedometer(5) // 5s window
	let matchedItemsPerSecond = 0
	const cancelledMatches = {total: 0, movement: 0, trip: 0}
	const avgWaitTime = movingAvg(100, 30) // past 100 items, pre-fill with 30ms
	const avgMatchTime = {
		all: movingAvg(100, 30), // past 100 items, pre-fill with 30ms
		movement: movingAvg(100, 30), // past 100 items, pre-fill with 30ms
		trip: movingAvg(100, 30), // past 100 items, pre-fill with 30ms
	}
	const seenTripIds = {
		all: new Set(),
		movement: new Set(),
		trip: new Set(),
	}
	const matchedTripIds = {
		all: new Set(),
		movement: new Set(),
		trip: new Set(),
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

	const limit = pLimit(matchConcurrency)
	const createMatch = (kind, natsChannel, timeout, tripId, _isMatched, _match) => {
		const waitAndMatch = (msg) => {
			let item = JSON.parse(msg.getData())
			receivedItems.total++
			receivedItems[kind]++

			const origTripId = tripId(item)
			seenTripIds.all.add(origTripId)
			seenTripIds[kind].add(origTripId)

			// Promises returned by p-limit are not cancelable yet, but we can
			// hack around this here.
			// see also sindresorhus/p-limit#25
			let cancelled = false
			const cancelTimer = setTimeout(() => {
				cancelled = true
				cancelledMatches.total++
				cancelledMatches[kind]++
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
				avgWaitTime.push(waitTime)
				avgMatchTime.all.push(matchTime)
				avgMatchTime[kind].push(matchTime)
				if (isMatched) {
					matchedItems.total++
					matchedItems[kind]++
					matchedTripIds.all.add(origTripId)
					matchedTripIds[kind].add(origTripId)
				}
				matchedItemsPerSecond = matchedItemsRate(isMatched ? 1 : 0)
			}

			limit(match)
			.catch(err => logger.error(err))
			.then(() => {
				natsStreaming.publish(natsChannel, JSON.stringify(item), (err) => {
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
		const movSub = natsStreaming.subscribe(movementsChannel, movSubOpts)
		const customMatchMovementWithGtfs = async (mv) => {
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
			mv => !!(mv.tripIds && mv.tripIds[gtfsInfo.endpointName]),
			customMatchMovementWithGtfs,
		))

		const tripAckWait = matchTripTimeout * 1.1 + 1000 // todo
		const tripSubOpts = subOpts().setAckWait(tripAckWait)
		const tripSub = natsStreaming.subscribe(tripsChannel, tripSubOpts)
		const matchTripAndShapeWithGtfs = async (trip) => {
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
			trip => !!(trip.ids && trip.ids[gtfsInfo.endpointName]),
			matchTripAndShapeWithGtfs,
		))

		// todo: handle errors
	})

	const reportStats = () => {
		logger.info({
			receivedItems,
			matchedItems,
			matchedItemsPerSecond: +matchedItemsPerSecond.toFixed(3),
			cancelledMatches,
			avgMatchTime: {
				all: avgMatchTime.all.get(),
				movement: avgMatchTime.movement.get(),
				trip: avgMatchTime.trip.get(),
			},
			avgWaitTime: avgWaitTime.get(),
			seenTripIds: {
				all: seenTripIds.all.size,
				movement: seenTripIds.movement.size,
				trip: seenTripIds.trip.size,
			},
			matchedTripIds: {
				all: matchedTripIds.all.size,
				movement: matchedTripIds.movement.size,
				trip: matchedTripIds.trip.size,
			},

			matchesRunning: limit.activeCount,
			matchesQueued: limit.pendingCount,
		})
	}
	const statsInterval = setInterval(reportStats, 5000)
	setImmediate(reportStats, 0)

	withSoftExit(() => {
		reportStats()
		clearInterval(statsInterval)
		natsStreaming.close()
		closeMatching().catch(onError)
	})
}

module.exports = runGtfsMatching
