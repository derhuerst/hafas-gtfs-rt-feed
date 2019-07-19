'use strict'

const createGtfsRtWriter = require('./writer')

const defaults = {
	debug: false,
	consumeTrips: true, // consume & convert `trip` events?
	consumePositions: true // consume & convert `position` events?
}

const createGtfsRtFeed = (monitor, opt = {}) => {
	const {
		debug, consumeTrips, consumePositions
	} = {...defaults, ...opt}

	const {out, writeTrip, writePosition} = createGtfsRtWriter(debug)
	if (consumeTrips) monitor.on('trip', writeTrip)
	if (consumePositions) monitor.on('position', writePosition)

	return out
}

module.exports = createGtfsRtFeed
