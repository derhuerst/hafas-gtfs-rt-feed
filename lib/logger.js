'use strict'

const pino = require('pino')

const stderr = pino.destination(2)

const createLogger = (name) => {
	return pino({
		name,
		level: process.env.LOG_LEVEL || 'info',
		base: {pid: process.pid},
	}, stderr)
}

module.exports = createLogger
