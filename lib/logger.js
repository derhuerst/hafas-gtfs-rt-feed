'use strict'

const pino = require('pino')

const createLogger = (name) => {
	return pino({
		name,
		level: process.env.LOG_LEVEL || 'info',
		base: {pid: process.pid},
	})
}

module.exports = createLogger
