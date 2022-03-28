'use strict'

const {equal, notEqual, deepStrictEqual: deepEqual} = require('assert')
const {DateTime} = require('luxon')

const SECOND = 1000

// OpenTripPlanner ignores stopovers with 0 seconds in between, as they would result in infinitely fast travel.
const shiftStopoverArrivalsDeparturesToAvoid0SecGaps = (trip) => {
	let cloned = false

	for (let i = 1; i < trip.stopovers.length; i++) {
		const arr = Date.parse(trip.stopovers[i].arrival)
		const diff = arr - Date.parse(trip.stopovers[i - 1].departure)
		if (!Number.isInteger(diff) || diff > 0) continue

		const newArr = DateTime
		.fromISO(trip.stopovers[i - 1].departure, {setZone: true})
		.plus(Math.max(diff, 0) + 1000)
		.toISO({suppressMilliseconds: true})

		if (!cloned) {
			cloned = true
			trip = {
				...trip,
				stopovers: trip.stopovers.map(st => ({...st})),
			}
		}

		trip.stopovers[i].arrival = newArr
		if (Date.parse(trip.stopovers[i].departure) === arr) {
			trip.stopovers[i].departure = newArr
		}
	}

	return trip
}

const t1 = {
	stopovers: [{
		arrival: null,
		departure: '2022-02-02T02:02:02+01:00',
	}, {
		arrival: '2022-02-02T03:03:03+01:00',
		departure: '2022-02-02T03:03:04+01:00',
	}, { // 0 seconds gap
		arrival: '2022-02-02T03:03:04+01:00',
		departure: '2022-02-02T03:03:04+01:00', // same as arrival
	}, { // 0 seconds gap
		arrival: '2022-02-02T03:03:04+01:00',
		departure: '2022-02-02T04:04:04+01:00',
	}, {
		arrival: '2022-02-02T05:05:05+01:00',
		departure: null,
	}],
}
const shiftedT1 = shiftStopoverArrivalsDeparturesToAvoid0SecGaps(t1)
notEqual(shiftedT1, t1)
deepEqual(shiftedT1, {
	stopovers: [{
		arrival: null,
		departure: '2022-02-02T02:02:02+01:00',
	}, {
		arrival: '2022-02-02T03:03:03+01:00',
		departure: '2022-02-02T03:03:04+01:00',
	}, {
		arrival: '2022-02-02T03:03:05+01:00',
		departure: '2022-02-02T03:03:05+01:00',
	}, {
		arrival: '2022-02-02T03:03:06+01:00',
		departure: '2022-02-02T04:04:04+01:00',
	}, {
		arrival: '2022-02-02T05:05:05+01:00',
		departure: null,
	}],
})

const t2 = {
	stopovers: [{
		arrival: null,
		departure: '2022-02-02T02:02:02+01:00',
	}, {
		arrival: '2022-02-02T05:05:05+01:00',
		departure: null,
	}],
}
const unchangedT2 = shiftStopoverArrivalsDeparturesToAvoid0SecGaps(t2)
equal(unchangedT2, t2)

module.exports = shiftStopoverArrivalsDeparturesToAvoid0SecGaps
