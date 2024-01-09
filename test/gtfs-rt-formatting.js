'use strict'

const {deepStrictEqual} = require('assert')
const {formatStopTimeUpdate} = require('../lib/gtfs-rt-writer')

const vbbStopoverWithoutArrival = {
	stopoverIndex: 123,
	stop: {
		type: 'stop',
		id: 'abc',
		name: 'aBc',
		location: {
			type: 'location',
			latitude: 1.23,
			longitude: 2.34,
		},
	},

	arrival: null,
	plannedArrival: null,
	arrivalDelay: null,

	departure: '2021-10-11T12:37:00+02:00',
	plannedDeparture: '2021-10-11T12:37:00+02:00',
	departureDelay: null,
}

const formattedVbbStopover = formatStopTimeUpdate(vbbStopoverWithoutArrival)
deepStrictEqual(formattedVbbStopover, {
	stop_id: 'abc',
	stop_sequence: 123,
	arrival: null,
	departure: {
		time: Date.parse('2021-10-11T12:37:00+02:00') / 1000 | 0,
		delay: null,
	},
	schedule_relationship: 0,
}, 'formatted StopTimeUpdate is not as expected')

console.info('formatStopTimeUpdate seems to work ✔︎')
