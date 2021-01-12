'use strict'

const createMonitor = require('hafas-monitor-trips')
const createLogger = require('./lib/logger')
const {POSITION, TRIP} = require('./lib/protocol')
const withSoftExit = require('./lib/soft-exit')

const logger = createLogger('monitor')

const runMonitor = (hafas, opt = {}) => {
	const {
		bbox,
		fetchTripsInterval,
	} = {
		bbox: process.env.BBOX
			? JSON.parse(process.env.BBOX)
			: 'null',
		fetchTripsInterval: process.env.FETCH_TRIPS_INTERVAL
			? parseInt(process.env.FETCH_TRIPS_INTERVAL)
			: 60 * 1000, // 60s
		...opt,
	}

	const monitor = createMonitor(hafas, bbox, {
		fetchTripsInterval,
	})
	monitor.on('error', (err) => {
		logger.error(err)
		if (!['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(err.code)) process.exit(1)
	})
	monitor.on('hafas-error', logger.warn.bind(logger))

	const writeNdjson = (item) => {
		process.stdout.write(JSON.stringify(item) + '\n')
	}
	monitor.on('position', (loc, movement) => {
		writeNdjson([POSITION, loc, movement])
	})
	monitor.on('trip', (trip) => {
		writeNdjson([TRIP, trip])
	})

	monitor.on('stats', logger.info.bind(logger))

	withSoftExit(() => {
		logger.debug('closing trips monitor')
		monitor.stop()
	})
}

module.exports = runMonitor
