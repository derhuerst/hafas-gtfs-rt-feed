'use strict'

const {DateTime} = require('luxon')
const {TripUpdate, VehiclePosition, FeedEntity} = require('gtfs-rt-bindings')
const max = require('lodash/max')
const {Readable} = require('stream')

const arrOf = st => st.arrival && Date.parse(st.arrival) || null
const depOf = st => st.departure && Date.parse(st.departure) || null

const formatWhen = t => Math.round(new Date(t) / 1000)

const formatTime = (isoStr) => {
	return DateTime
	// todo [breaking]: support customisable timezone & locale
	.fromISO(isoStr, {setZone: true})
	.toFormat('HH:mm:ss')
}
const formatDate = (isoStr) => {
	return DateTime
	// todo [breaking]: support customisable timezone & locale
	.fromISO(isoStr, {setZone: true})
	.toFormat('yyyyMMdd')
}

const {SCHEDULED, SKIPPED} = TripUpdate.StopTimeUpdate.ScheduleRelationship
const {STOPPED_AT, IN_TRANSIT_TO} = VehiclePosition.VehicleStopStatus

const formatStopTimeUpdate = (st) => {
	const s = st.stop
	const arr = st.arrival || st.prognosedArrival || st.plannedArrival
	const dep = st.departure || st.prognosedDeparture || st.plannedDeparture
	return {
		stop_id: s && s.ids && s.ids.gtfs || s.id || null,
		stop_sequence: 'number' === typeof st.stopoverIndex ? st.stopoverIndex : null,
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

const formatTripUpdate = (trip, opt = {}) => {
	const {
		now,
	} = {
		now: Date.now(),
		...opt,
	}

	const l = trip.line
	const dep = trip.plannedDeparture

	const currOrUpcomingSt = trip.stopovers.find((st) => {
		const dep = depOf(st)
		const arr = arrOf(st)
		return dep ? dep >= now : (arr && arr >= now)
	})
	const delay = currOrUpcomingSt
		? (arrOf(currOrUpcomingSt) > now
			? currOrUpcomingSt.arrivalDelay
			: currOrUpcomingSt.departureDelay
		) : null

	return {
		trip: {
			trip_id: trip.ids && trip.ids.gtfs || trip.id || null,
			route_id: (
				trip.routeIds && trip.routeIds.gtfs || trip.routeId
				|| l && l.ids && l.ids.gtfs || l.id
				|| null
			),
			// todo: direction_id, matching GTFS?
			start_time: dep ? formatTime(dep) : null,
			start_date: dep ? formatDate(dep) : null,
		},
		vehicle: {
			// todo: HAFAS fahrtNrs are not unique apparently
			// see public-transport/hafas-client#194
			id: l && (l.vehicleId || l.fahrtNr) || null,
			label: trip.direction || null
		},
		stop_time_update: trip.stopovers.map(formatStopTimeUpdate),
		// todo: timestamp, see https://github.com/public-transport/hafas-client/issues/9#issuecomment-501435639
		delay,
	}
}

// arrival and departure might be equal, so we add a 10s buffer
const stopoverWithBuffer = (st) => {
	const dep = depOf(st)
	const arr = arrOf(st)
	if (!dep || !arr || dep !== arr) return st // todo: roughly
	return {
		...st,
		arrival: new Date(arr - 5 * 1000).toISOString(),
		departure: new Date(dep + 5 * 1000).toISOString()
	}
}
const isReasonableStopover = (st) => {
	return !st.cancelled && (st.departure || st.arrival)
}

const formatVehiclePosition = (movement, opt = {}) => {
	const {
		now,
	} = {
		now: Date.now(),
		...opt,
	}

	const l = movement.line
	const stopovers = (movement.nextStopovers || [])
		.filter(isReasonableStopover)
		.map(stopoverWithBuffer)
	const currSt = stopovers.find((st) => {
		const arr = arrOf(st)
		const dep = depOf(st)
		return !((arr && arr > now) || (dep && dep < now))
	})
	const latestSt = max(stopovers.map(st => +new Date(st.departure || st.arrival)))
	const nextSt = stopovers.find((st) => {
		const arr = arrOf(st)
		const dep = depOf(st)
		return (arr && arr > now) || (dep && dep > now)
	})

	return {
		trip: {
			trip_id: movement.tripIds && movement.tripIds.gtfs || movement.tripId || null,
			route_id: (
				movement.routeIds && movement.routeIds.gtfs || movement.routeId
				|| l && l.ids && l.ids.gtfs || l.id
				|| null
			),
			// todo: direction_id, matching GTFS?
		},
		vehicle: {
			id: l && (l.vehicleId || l.fahrtNr) || null,
			label: movement.direction || null
		},
		position: movement.location ? {
			latitude: movement.location.latitude,
			longitude: movement.location.longitude
			// todo: calculate bearing & speed from `movement.frames`?
		} : null,
		stop_id: now > latestSt
			? null
			: currSt ? currSt.stop.id : nextSt && nextSt.stop.id,
		// todo: use INCOMING_AT as well
		current_status: now > latestSt
			? null
			: currSt ? STOPPED_AT : IN_TRANSIT_TO
		// todo: occupancy_status, maybe from https://github.com/public-transport/hafas-client/pull/112
		// todo: timestamp, see https://github.com/public-transport/hafas-client/issues/9#issuecomment-501435639
	}
}

module.exports = {
	formatStopTimeUpdate,
	formatTripUpdate,
	formatVehiclePosition,
}
