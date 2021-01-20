'use strict'

const {
	normalizeStopName,
	normalizeLineName,
} = require('./normalize')

const hafasInfo = {
	endpointName: 'vbb-hafas',
	normalizeStopName,
	normalizeLineName,
}

module.exports = hafasInfo
