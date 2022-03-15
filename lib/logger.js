'use strict'

const pino = require('pino')

const createLogger = (name) => {
	return pino({
		name,
		level: process.env.LOG_LEVEL || 'info',
		base: {pid: process.pid},
		redact: [
			// With network & HAFAS errors, hafas-client exposes the entire fetch request.
			// We don't want all the nitty-gritty details though.
			'err.fetchRequest.agent',

			'err.fetchRequest.headers.authorization',
			'err.fetchRequest.headers.Authorization',
		],
	})
}

module.exports = createLogger
