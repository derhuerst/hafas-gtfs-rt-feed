'use strict'

const {
	createMatchTrip,
	createMatchMovement,
	close: closeMatching,
} = require('match-gtfs-rt-to-gtfs')
const findShape = require('match-gtfs-rt-to-gtfs/find-shape')
const truncateAtInSeatTransfer = require('./truncate-at-in-seat-transfer')

const MATCHED = Symbol.for('match-gtfs-rt-to-gtfs:matched')
const CACHED = Symbol.for('match-gtfs-rt-to-gtfs:cached')

const createMatchWithGtfs = (cfg) => {
	const {
		hafasInfo, gtfsInfo,
		beforeMatchTrip, beforeMatchMovement,
		matchTripPolylines,
		logger,
	} = cfg

	const matchMovementWithGtfs = createMatchMovement(hafasInfo, gtfsInfo)
	const customMatchMovementWithGtfs = async (mv) => {
		mv = await beforeMatchMovement(mv)
		const matched = await matchMovementWithGtfs(mv)
		// We don't want to serialize the whole trip, but keep all GTFS-RT-
		// relevant fields. This is an ugly ad-hoc hack, there should be a
		// better way to solve this.
		if (matched.trip) {
			const t = matched.trip
			matched.tripDirectionId = t.directionIds && t.directionIds.gtfs || t.directionId || null
			matched.tripDirectionIds = t.directionIds || {}
			matched.tripOrigin = matched.trip.origin
			matched.tripPlannedDeparture = matched.trip.plannedDeparture
			matched.tripDestination = matched.trip.destination
			matched.tripPlannedArrival = matched.trip.plannedArrival
		}
		return matched
	}

	const matchTripWithGtfs = createMatchTrip(hafasInfo, gtfsInfo)
	const matchTripAndShapeWithGtfs = async (trip) => {
		trip = await beforeMatchTrip(trip)
		trip = truncateAtInSeatTransfer(trip)
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

	const createMatchWithLogging = (kind, tripId, match) => {
		const matchWithLogging = async (origItem, waitTime) => {
			const origTripId = tripId(origItem)

			const t0 = Date.now()
			const item = await match(origItem)
			const matchTime = Date.now() - t0
			const isMatched = item[MATCHED] === true
			const isCached = item[CACHED] === true

			logger.debug({
				origTripId, isMatched, matchTime, waitTime,
			}, [
				isMatched ? 'matched' : 'failed to match',
				isCached ? 'from cache' : 'fresh',
				kind, 'in', matchTime, 'after', waitTime, 'waiting',
			].join(' '))

			return {
				item,
				isMatched, isCached,
				matchTime,
			}
		}
		return matchWithLogging
	}

	const matchMovementWithLogging = createMatchWithLogging(
		'movement',
		mv => mv.tripId,
		customMatchMovementWithGtfs,
	)

	const matchTripWithLogging = createMatchWithLogging(
		'trip',
		trip => trip.id,
		matchTripAndShapeWithGtfs,
	)

	return {
		matchMovementWithGtfs: matchMovementWithLogging,
		matchTripWithGtfs: matchTripWithLogging,
	}
}

module.exports = {
	createMatchWithGtfs,
	closeMatching,
}
