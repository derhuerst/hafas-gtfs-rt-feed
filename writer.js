'use strict'

const {TripUpdate, VehiclePosition, FeedMessage} = require('gtfs-rt-bindings')
const {Readable} = require('stream')

const formatWhen = t => Math.round(new Date(t) / 1000)

const {SCHEDULED, SKIPPED} = TripUpdate.StopTimeUpdate.ScheduleRelationship
const {STOPPED_AT, IN_TRANSIT_TO} = VehiclePosition.VehicleStopStatus

const formatStopTimeUpdate = (st) => {
	const arr = st.arrival || st.scheduledArrival
	const dep = st.departure || st.scheduledDeparture
	return {
		// todo: does it have to match GTFS?
		stop_id: st.stop && st.stop.id || null,
		// todo: stop_sequence, matching GTFS?
		arrival: {
			time: arr ? formatWhen(arr) : null,
			delay: 'number' === typeof st.arrivalDelay ? st.arrivalDelay : null
			// todo: uncertainty
		},
		departure: {
			time: dep ? formatWhen(dep) : null,
			delay: 'number' === typeof st.departureDelay ? st.departureDelay : null
			// todo: uncertainty
		},
		schedule_relationship: st.cancelled ? SKIPPED : SCHEDULED
	}
}

const formatTripUpdate = (trip) => {
	return {
		trip: {
			// todo: make these match the GTFS feeds
			trip_id: trip.id || null,
			route_id: trip.line && trip.line.id || null
			// todo: direction_id, matching GTFS?
		},
		vehicle: {
			id: trip.line && trip.line.fahrtNr || null,
			label: trip.direction || null
		},
		stop_time_update: trip.stopovers.map(formatStopTimeUpdate)
		// todo: timestamp, see https://github.com/public-transport/hafas-client/issues/9#issuecomment-501435639
	}
}

// arrival and departure might be equal, so we add a 10s buffer
const stopoverWithBuffer = (st) => {
	const dep = st.departure && +new Date(st.departure)
	const arr = st.arrival && +new Date(st.arrival)
	if (dep !== arr) return st // todo: roughly
	return {
		...st,
		arrival: new Date(arr - 5 * 1000).toISOString(),
		departure: new Date(dep + 5 * 1000).toISOString()
	}
}
const isReasonableStopover = (st) => {
	return !st.cancelled && (st.departure || st.arrival)
}

const formatVehiclePosition = (movement) => {
	const stopovers = (movement.nextStopovers || [])
		.filter(isReasonableStopover)
		.map(stopoverWithBuffer)
	const t = Date.now()
	const currSt = stopovers.find((st) => {
		const arr = st.arrival && +new Date(st.arrival)
		const dep = st.departure && +new Date(st.departure)
		return (!arr || arr <= t) && (!dep || dep >= t)
	})
	const nextSt = stopovers.find((st) => {
		const arr = st.arrival && +new Date(st.arrival)
		const dep = st.departure && +new Date(st.departure)
		return (arr && arr > t) || (dep && dep > t)
	})

	return {
		trip: {
			// todo: make these match the GTFS feeds
			trip_id: movement.tripId || null,
			route_id: movement.line && movement.line.id || null
			// todo: direction_id, matching GTFS?
		},
		vehicle: {
			id: movement.line && movement.line.fahrtNr || null,
			label: movement.direction || null
		},
		position: movement.location ? {
			latitude: movement.location.latitude,
			longitude: movement.location.longitude
			// todo: calculate bearing & speed from `movement.frames`?
		} : null,
		// todo: check if these are correct
		stop_id: currSt ? currSt.stop.id : nextSt && nextSt.stop.id,
		current_status: currSt ? STOPPED_AT : IN_TRANSIT_TO
		// todo: occupancy_status, maybe from https://github.com/public-transport/hafas-client/pull/112
		// todo: timestamp, see https://github.com/public-transport/hafas-client/issues/9#issuecomment-501435639
	}
}

const createGtfsRtWriter = (debug = false) => {
	const encodeFeedMessage = (entity) => {
		const msg = {
			header: {
				gtfs_realtime_version: '2.0',
				timestamp: formatWhen(Date.now())
			},
			entity: [entity]
		}
		return debug ? msg : FeedMessage.encode(msg)
	}

	const out = new Readable({
		read: () => {},
		// AFAICT you can't tell the length of an item in a Protocol Buffer,
		// so we have to avoid concatenating encoded feed messages.
		objectMode: true,
		highWaterMark: 3
	})

	const writeTrip = (trip) => {
		// todo: validate using ajv
		try {
			const entity = {
				id: '1', // todo: does it have to increase?
				trip_update: formatTripUpdate(trip)
			}
			out.push(encodeFeedMessage(entity))
		} catch(err) {
			out.emit('error', err)
		}
	}

	const writePosition = (_, movement) => {
		// todo: validate using ajv
		try {
			const entity = {
				id: '1', // todo: does it have to increase?
				vehicle: formatVehiclePosition(movement)
			}
			out.push(encodeFeedMessage(entity))
		} catch(err) {
			out.emit('error', err)
		}
	}

	return {out, writeTrip, writePosition}
}

module.exports = createGtfsRtWriter
