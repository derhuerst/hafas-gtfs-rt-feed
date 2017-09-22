'use strict'

const through = require('through2')
const Pbf = require('pbf')
const {TripUpdate} = require('gtfs-rt-bindings')

const formatDate = (s) => Math.round(new Date(s) / 1000)

const createConvert = () => {
	return through.obj((dep, _, cb) => {
		const tripUpdate = new Pbf()
		TripUpdate.write({
			trip: {
				trip_id: dep.trip + '',
				route_id: dep.line.id
			},
			stop_time_update: [{
				departure: {
					delay: dep.delay || 0, time: formatDate(dep.when)
				}
			}]
		}, tripUpdate)

		const buf = tripUpdate.finish()
		cb(null, buf)
	})
}

module.exports = createConvert
