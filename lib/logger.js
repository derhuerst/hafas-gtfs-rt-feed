'use strict'

const pino = require('pino')

const stderr = pino.destination(2)

const createLogger = (name) => {
	return pino({
		name,
		base: {pid: process.pid},
	}, stderr)
}

module.exports = createLogger
