'use strict'

const createMonitor = require('hafas-monitor-trips')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const createLogger = require('./logger')
const withSoftExit = require('./soft-exit')
const flattenTripPolyline = require('./flatten-trip-polyline')

const MAJOR_VERSION = require('./major-version')

const logger = createLogger('monitor')

const runMonitor = (hafas, opt = {}) => {
	const clientId = Math.random().toString(16).slice(2, 6)
	const {
		bbox,
		fetchTripsInterval,
		fetchTripPolylines,
		natsStreamingUrl,
		natsClusterId,
		natsClientId,
		natsClientName,
		movementsChannel,
		tripsChannel,
		maxInflightPublishes,
	} = {
		bbox: process.env.BBOX
			? JSON.parse(process.env.BBOX)
			: 'null',
		fetchTripsInterval: process.env.FETCH_TRIPS_INTERVAL
			? parseInt(process.env.FETCH_TRIPS_INTERVAL)
			: 60 * 1000, // 60s
		fetchTripPolylines: process.env.FETCH_TRIP_POLYLINES === 'true',
		natsStreamingUrl: process.env.NATS_STREAMING_URL || 'nats://localhost:4222',
		natsClusterId: process.env.NATS_CLUSTER_ID || 'test-cluster',
		natsClientId: process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-monitor-${clientId}`,
		natsClientName: process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-monitor`,
		movementsChannel: process.env.MOVEMENTS_CHANNEL || 'movements',
		tripsChannel: process.env.TRIPS_CHANNEL || 'trips',
		maxInflightPublishes: 500,
		...opt,
	}

	const monitor = createMonitor(hafas, bbox, {
		fetchTripsInterval,
		hafasTripOpts: {
			polyline: !!fetchTripPolylines,
		},
	})
	monitor.on('error', (err) => {
		logger.error(err)
		if (!['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(err.code)) process.exit(1)
	})
	monitor.on('hafas-error', logger.warn.bind(logger))

	const natsStreaming = connectToNatsStreaming(natsClusterId, natsClientId, {
		url: natsStreamingUrl,
		name: natsClientName,
		maxPubAcksInflight: maxInflightPublishes,
	})

	const publish = (channel, item) => {
		if (natsStreaming.isClosed()) return; // todo: why?
		natsStreaming.publish(channel, JSON.stringify(item), (err) => {
			if (!err) return;
			logger.error(err)
		})
	}
	monitor.on('position', (position, movement) => {
		// publish('positions', position)
		publish(movementsChannel, movement)
	})
	monitor.on('trip', (trip) => {
		if (trip.polyline) trip.polyline = flattenTripPolyline(trip.polyline)
		publish(tripsChannel, trip)
	})

	monitor.on('stats', logger.info.bind(logger))

	withSoftExit(() => {
		logger.debug('closing trips monitor & nats-streaming client')
		natsStreaming.close()
		monitor.stop()
	})
}

module.exports = runMonitor
