'use strict'

const createMonitor = require('hafas-monitor-trips')
const fetchTrips = require('hafas-monitor-trips/fetch-trips')
const rightAwayStrategy = require('hafas-monitor-trips/fetch-trips/right-away')
const {Counter} = require('prom-client')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const createLogger = require('./logger')
const {createMetricsServer, register} = require('./metrics')
const withSoftExit = require('./soft-exit')
const flattenTripPolyline = require('./flatten-trip-polyline')

const MAJOR_VERSION = require('./major-version')

const logger = createLogger('monitor')

const onError = (err) => {
	logger.error(err)
	process.exit(1)
}

const runMonitor = (hafas, opt = {}) => {
	const clientId = Math.random().toString(16).slice(2, 6)
	const {
		bbox,
		fetchTripPolylines,
		natsStreamingUrl,
		natsClusterId,
		natsClientId,
		natsClientName,
		movementsChannel,
		tripsChannel,
		maxInflightPublishes,
		movementsFetchMode,
		tripsFetchMode,
		demandChannel,
		hafasMonitorTripsOpts,
	} = {
		bbox: process.env.BBOX
			? JSON.parse(process.env.BBOX)
			: null,
		fetchTripPolylines: process.env.FETCH_TRIP_POLYLINES === 'true',
		natsStreamingUrl: process.env.NATS_STREAMING_URL || 'nats://localhost:4222',
		natsClusterId: process.env.NATS_CLUSTER_ID || 'test-cluster',
		natsClientId: process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-monitor-${clientId}`,
		natsClientName: process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-monitor`,
		movementsChannel: process.env.MOVEMENTS_CHANNEL || 'movements',
		tripsChannel: process.env.TRIPS_CHANNEL || 'trips',
		maxInflightPublishes: 1000,
		movementsFetchMode: 'continuously',
		tripsFetchMode: 'continuously',
		demandChannel: process.env.DEMAND_CHANNEL || 'demand',
		hafasMonitorTripsOpts: {
			// todo: let hafas-monitor-trips read this from the HAFAS client?
			maxRadarResults: process.env.HAFAS_MAX_RADAR_RESULTS
				? parseInt(process.env.HAFAS_MAX_RADAR_RESULTS)
				: null,
		},
		...opt,
	}
	if (!bbox) {
		throw new Error('opt.bbox must be an object, or $BBOX must be set to a JSON object')
	}
	if (!['on-demand', 'continuously'].includes(movementsFetchMode)) {
		throw new Error('opt.movementsFetchMode must be `on-demand` or `continuously`.')
	}
	if (!['never', 'on-demand', 'continuously'].includes(tripsFetchMode)) {
		throw new Error('opt.tripsFetchMode must be `never`, `on-demand` or `continuously`.')
	}

	let fetchTilesInterval = 'fetchTilesInterval' in opt
		? opt.fetchTilesInterval
		: (process.env.FETCH_TILES_INTERVAL
			? parseInt(process.env.FETCH_TILES_INTERVAL)
			: 60 * 1000 // 60s
		)
	if ('function' !== typeof fetchTilesInterval) {
		const _fetchTilesInterval = fetchTilesInterval
		fetchTilesInterval = () => _fetchTilesInterval
	}

	const defaultMovementsDemandDuration = opt.movementsDemandDuration || (
		process.env.DEMAND_DURATION
			? parseInt(process.env.DEMAND_DURATION)
			: null
	)
	const defaultTripsDemandDuration = opt.tripsDemandDuration || (
		process.env.DEMAND_DURATION
			? parseInt(process.env.DEMAND_DURATION)
			: null
	)

	const metricsServer = createMetricsServer()
	metricsServer.start()
	.then(
		() => {
			logger.info(`serving Prometheus metrics on port ${metricsServer.address().port}`)
		},
		onError,
	)

	const natsStreamingSentTotal = new Counter({
		name: 'nats_streaming_sent_total',
		help: 'nr. of messages published to NATS streaming',
		registers: [register],
		labelNames: ['channel'],
	})
	const natsStreamingErrorsTotal = new Counter({
		name: 'nats_streaming_errors_total',
		help: 'nr. of failures publishing to NATS streaming',
		registers: [register],
		labelNames: ['channel'],
	})

	const monitor = createMonitor(hafas, bbox, {
		...hafasMonitorTripsOpts,
		fetchTilesInterval,
		metricsRegistry: register,
	})
	monitor.on('error', (err) => {
		logger.error(err)
		if (['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENETDOWN'].includes(err.code)) return;
		// Handle failures to obtain a resource (assigned IP address) from https://npmjs.com/package/generic-pool,
		// as caused by https://npmjs.com/package/localaddress-agent.
		// todo: find a cleaner way to do this
		if (err.message.includes('ResourceRequest timed out')) return;
		process.exit(1)
	})
	monitor.on('hafas-error', logger.warn.bind(logger))
	monitor.on('hafas-client-error', logger.warn.bind(logger))

	// todo: use NATS JetStream
	const natsStreaming = connectToNatsStreaming(natsClusterId, natsClientId, {
		url: natsStreamingUrl,
		name: natsClientName,
		maxPubAcksInflight: maxInflightPublishes,
	})

	const publish = (channel, item) => {
		if (natsStreaming.isClosed()) return; // todo: why?
		natsStreaming.publish(channel, JSON.stringify(item), (err) => {
			if (err) {
				natsStreamingErrorsTotal.inc({channel})
				logger.error(err)
			} else {
				natsStreamingSentTotal.inc({channel})
			}
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

	const listenForDemand = (onDemand, onConnect = () => {}) => {
		natsStreaming.once('connect', () => {
			// NATS Streaming is work stealing instead of fan-out, so
			// this won't work with >1 monitor instances.
			// todo: use e.g. plain NATS for fan-out
			const subOpts = natsStreaming.subscriptionOptions()
			.setStartWithLastReceived()
			const demandSub = natsStreaming.subscribe(demandChannel, subOpts)
			demandSub.on('message', onDemand)
			onConnect()
		})
	}

	let noMovementsDemandTimer = null
	if (movementsFetchMode === 'on-demand') {
		const onNoDemand = () => {
			logger.debug('pausing movements fetching because of lack of demand')
			monitor.stop()
		}
		const onDemand = (msg) => {
			clearTimeout(noMovementsDemandTimer)
			const movementsDemandDuration = defaultMovementsDemandDuration === null
				? fetchTilesInterval() * 5.1
				: defaultMovementsDemandDuration
			setTimeout(onNoDemand, movementsDemandDuration)

			logger.debug('restarting movements fetching because of demand')
			monitor.start()

			if (msg) msg.ack()
		}

		listenForDemand(onDemand, onDemand)
	}

	let tripsDemandUntil = 0
	let shouldFetchTrips = () => true
	if (tripsFetchMode === 'on-demand') {
		const onDemand = (msg) => {
			const tripsDemandDuration = defaultTripsDemandDuration === null
				? fetchTilesInterval() * 2.1
				: defaultTripsDemandDuration
			tripsDemandUntil = Date.now() + tripsDemandDuration
			if (msg) msg.ack()
		}
		listenForDemand(onDemand)

		shouldFetchTrips = () => Date.now() <= tripsDemandUntil
	}
	if (tripsFetchMode === 'on-demand' || tripsFetchMode === 'continuously') {
		fetchTrips(monitor, {
			strategy: rightAwayStrategy(shouldFetchTrips),
			hafasTripOpts: {
				polyline: !!fetchTripPolylines,
			},
			metricsRegistry: register,
		})
	}

	withSoftExit(() => {
		logger.debug('closing trips monitor, nats-streaming client & metrics server')
		natsStreaming.close()
		monitor.quit()
		metricsServer.close()
		clearTimeout(noMovementsDemandTimer)
	})
}

module.exports = runMonitor
