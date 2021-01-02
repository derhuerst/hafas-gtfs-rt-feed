'use strict'

const {TripUpdate, VehiclePosition, FeedEntity} = require('gtfs-rt-bindings')
const {Readable} = require('stream')
const writer = require('./lib/gtfs-rt-writer')

const createGtfsRtWriter = (opt = {}) => {
	const {
		encodePbf,
	} = {
		encodePbf: true,
		...opt
	}

	const {
		formatTrip,
		formatMovement,
	} = writer()

	const writeFeedEntity = (entity) => {
		entity.id = (++id) + ''
		out.push(encodePbf ? FeedEntity.encode(entity) : entity)
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
			out.push(formatTrip(trip))
		} catch(err) {
			out.emit('error', err)
		}
	}

	const writePosition = (_, movement) => {
		// todo: validate using ajv
		try {
			out.push(formatMovement(movement))
		} catch(err) {
			out.emit('error', err)
		}
	}

	return {out, writeTrip, writePosition}
}

createGtfsRtWriter.gtfs_realtime_version = '2.0'
module.exports = createGtfsRtWriter
