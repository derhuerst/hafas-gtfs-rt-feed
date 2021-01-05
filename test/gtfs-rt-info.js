'use strict'

const {
	normalizeStopName,
	normalizeLineName,
} = require('./normalize')

const gtfsRtInfo = {
	endpointName: 'vbb-hafas',
	normalizeStopName,
	normalizeLineName,
}

module.exports = gtfsRtInfo
