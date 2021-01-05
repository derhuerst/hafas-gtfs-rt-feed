'use strict'

const {
	normalizeStopName,
	normalizeLineName,
} = require('./normalize')

const gtfsInfo = {
	endpointName: 'gtfs',
	normalizeStopName,
	normalizeLineName,
}

module.exports = gtfsInfo
