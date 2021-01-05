'use strict'

const tokenize = require('tokenize-vbb-station-name')
const slugg = require('slugg')

const normalizeStopName = (name) => {
	return tokenize(name, {meta: 'remove'}).join('-')
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
