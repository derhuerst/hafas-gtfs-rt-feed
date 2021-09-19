'use strict'

const _normalizeStopName = require('normalize-vbb-station-name-for-search')
const slugg = require('slugg')

const normalizeStopName = (name) => {
	try {
		return _normalizeStopName(name)
	} catch (err) {
		if (err.isParseError) return name
		throw err
	}
}

// we match hafas-client here
// https://github.com/public-transport/hafas-client/blob/8ed218f4d62a0c220d453b1b1ffa7ce232f1bb83/parse/line.js#L13
const normalizeLineName = (name) => {
	return slugg(name.replace(/([a-zA-Z]+)\s+(\d+)/g, '$1$2'))
}

module.exports = {
	normalizeStopName,
	normalizeLineName,
}
