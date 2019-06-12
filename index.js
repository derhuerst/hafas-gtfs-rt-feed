'use strict'

// const {DateTime} = require('luxon')
const {TripUpdate, VehiclePosition} = require('gtfs-rt-bindings')
const {Readable} = require('stream')

const formatWhen = t => Math.round(new Date(t) / 1000)

const {SCHEDULED, SKIPPED} = TripUpdate.StopTimeUpdate.ScheduleRelationship
const {STOPPED_AT, IN_TRANSIT_TO} = VehiclePosition.VehicleStopStatus

const encodeStopTimeUpdate = (st) => {
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

const encodeTripUpdate = (trip) => {
	return TripUpdate.encode({
		trip: {
			// todo: make these match the GTFS feeds
			trip_id: trip.id || null,
			route_id: trip.line && trip.line.id || null
			// todo: direction_id, matching GTFS?
		},
		vehicle: {
			id: trip.line && trip.line.fahrtNr || null,
			label: trip.line && trip.line.direction || null
		},
		stop_time_update: trip.stopovers.map(encodeStopTimeUpdate)
		// todo: timestamp, see https://github.com/public-transport/hafas-client/issues/9#issuecomment-501435639
	})
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

const encodeVehiclePosition = (movement) => {
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

	return VehiclePosition.encode({
		trip: {
			// todo: make these match the GTFS feeds
			trip_id: movement.tripId || null,
			route_id: movement.line && movement.line.id || null
			// todo: direction_id, matching GTFS?
		},
		vehicle: {
			id: movement.line && movement.line.fahrtNr || null,
			label: movement.line && movement.line.direction || null
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
	})
}

const createGtfsRtFeed = (monitor) => {
	const out = new Readable({
		read: () => {},
		highWaterMark: 1000
	})

	monitor.on('trip', (trip) => {
		// todo: validate using ajv
		try {
			out.push(encodeTripUpdate(trip))
		} catch(err) {
			out.emit('error', err)
		}
	})
	monitor.on('position', (_, movement) => {
		// todo: validate using ajv
		try {
			out.push(encodeVehiclePosition(movement))
		} catch(err) {
			out.emit('error', err)
		}
	})

	return out

	// return through.obj((dep, _, cb) => {
	// 	const tripUpdate = new Pbf()
	// 	TripUpdate.write({
	// 		trip: {
	// 			trip_id: dep.trip + '',
	// 			route_id: dep.line.id
	// 		},
	// 		stop_time_update: [{
	// 			departure: {
	// 				delay: dep.delay || 0,
	// 				time: formatWhen(dep.when)
	// 			}
	// 		}]
	// 	}, tripUpdate)

	// 	const buf = tripUpdate.finish()
	// 	cb(null, buf)
	// })
}

module.exports = createGtfsRtFeed
