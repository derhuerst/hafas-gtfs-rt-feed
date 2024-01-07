'use strict'

const {Counter, Summary, Gauge} = require('prom-client')
const differentialToFullDataset = require('gtfs-rt-differential-to-full-dataset')
const {performance} = require('perf_hooks')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const throttle = require('lodash/throttle')
const computeEtag = require('etag')
const serveBuffer = require('serve-buffer')
const createCors = require('cors')
const {createServer} = require('http')
const sendFile = require('send')
const pick = require('lodash/pick')
const createLogger = require('./logger')
const {createMetricsServer, register} = require('./metrics')
const shiftTimesToEnsureGaps = require('./shift-times-to-ensure-gaps')
const createGtfsRtWriter = require('./gtfs-rt-writer')
const withSoftExit = require('./soft-exit')

const MAJOR_VERSION = require('./major-version')

const logger = createLogger('serve')

const onError = (err) => {
	if (!err) return;
	logger.error(err)
	process.exit(1)
}

const serveGtfsRtViaHttp = (opt = {}) => {
	const _natsId = Math.random().toString(16).slice(2, 6)
	const {
		feedId,
		natsStreamingUrl,
		natsClusterId,
		natsClientId,
		natsClientName,
		matchedMovementsChannel,
		matchedTripsChannel,
		pathToStaticFeedInfo,
		staticFeedUrl,
		signalDemand: shouldSignalDemand,
		shiftStopoverTimesToEnsureGaps,
	} = {
		feedId: process.env.FEED_ID || _natsId,
		natsStreamingUrl: process.env.NATS_STREAMING_URL || 'nats://localhost:4222',
		natsClusterId: process.env.NATS_CLUSTER_ID || 'test-cluster',
		natsClientId: process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-serve-${_natsId}`,
		natsClientName: process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-serve`,
		matchedMovementsChannel: process.env.MATCHED_MOVEMENTS_CHANNEL || 'matched-movements',
		matchedTripsChannel: process.env.MATCHED_TRIPS_CHANNEL || 'matched-trips',
		signalDemand: false,
		shiftStopoverTimesToEnsureGaps: process.env.SHIFT_STOPOVER_TIMES_TO_ENSURE_GAPS === 'true',
		...opt,
	}

	const metricsServer = createMetricsServer()
	metricsServer.start()
	.then(
		() => {
			logger.info(`serving Prometheus metrics on port ${metricsServer.address().port}`)
		},
		onError,
	)

	const natsStreamingReceivedTotal = new Counter({
		name: 'nats_streaming_received_total',
		help: 'nr. of messages received from NATS streaming',
		registers: [register],
		labelNames: ['channel'],
	})
	const digestTime = new Summary({
		name: 'digest_time_seconds',
		help: 'time needed to add a movement/trip into the GTFS-RT feed',
		registers: [register],
		labelNames: ['kind'],
	})
	const feedSize = new Gauge({
		name: 'feed_size_raw_bytes',
		help: 'size of the final GTFS-RT feed',
		registers: [register],
		labelNames: ['compression'],
	})

	const {
		formatTrip, formatMovement,
	} = createGtfsRtWriter()

	const differentialToFull = differentialToFullDataset({
		ttl: 5 * 60 * 1000, // 5m
	})

	const natsStreaming = connectToNatsStreaming(natsClusterId, natsClientId, {
		url: natsStreamingUrl,
		name: natsClientName,
	})

	const subOpts = () => {
		return natsStreaming.subscriptionOptions()
		.setMaxInFlight(300) // todo
	}
	const natsQueueGroup = 'serve'

	let signalDemand = () => {}

	natsStreaming.once('connect', () => {
		const movSubOpts = subOpts()
		.setDurableName(`v${MAJOR_VERSION}-${feedId}-movements`)
		const movSub = natsStreaming.subscribe(matchedMovementsChannel, natsQueueGroup, movSubOpts)
		movSub.on('message', (msg) => {
			const movement = JSON.parse(msg.getData())
			natsStreamingReceivedTotal.inc({channel: matchedMovementsChannel})

			const t0 = performance.now()
			differentialToFull.write(formatMovement(movement))
			digestTime.observe({kind: 'movement'}, (performance.now() - t0) / 1000)

			msg.ack()
		})

		const tripsSubOpts = subOpts()
		.setDurableName(`v${MAJOR_VERSION}-${feedId}-trips`)
		const tripsSub = natsStreaming.subscribe(matchedTripsChannel, natsQueueGroup, tripsSubOpts)
		tripsSub.on('message', (msg) => {
			let trip = JSON.parse(msg.getData())
			natsStreamingReceivedTotal.inc({channel: matchedTripsChannel})

			const t0 = performance.now()
			if (shiftStopoverTimesToEnsureGaps) {
				trip = shiftTimesToEnsureGaps(trip)
			}
			differentialToFull.write(formatTrip(trip))
			digestTime.observe({kind: 'trip'}, (performance.now() - t0) / 1000)

			msg.ack()
		})

		if (shouldSignalDemand) {
			const publishCb = (err) => {
				if (err) logger.error(err)
			}
			signalDemand = throttle(() => {
				logger.debug('signalling demand')
				natsStreaming.publish('demand', '', publishCb)
			}, 3 * 1000)
		}
		// todo: handle errors
	})

	let feed = Buffer.alloc(0)
	let timeModified = new Date(0)
	let etag = computeEtag(feed)
	const updateFeed = throttle(() => {
		feed = differentialToFull.asFeedMessage()
		timeModified = new Date()
		feedSize.set({compression: 'none'}, feed.length)
		etag = computeEtag(feed) // todo: add computation time as metric
	}, 100)
	differentialToFull.on('change', updateFeed)
	setImmediate(updateFeed)

	const onRequest = (req, res) => {
		const reqForLogging = pick(req, [
			'httpVersion',
			'method',
			'url',
			'headers',
		])

		const path = new URL(req.url, 'http://localhost').pathname
		if (path === '/') {
			signalDemand()

			logger.debug({
				req: reqForLogging,
				timeModified, etag,
			}, 'serving feed')
			serveBuffer(req, res, feed, {
				timeModified, etag,
				gzipMaxSize: 20 * 1024 * 1024, // 20mb
				brotliCompressMaxSize: 1024 * 1024, // 1mb
				unmutatedBuffers: true,
			})
		} else if (path === '/health') {
			// todo: make this logic customisable
			const isHealthy = (
				(Date.now() - timeModified <= 5 * 60 * 1000) // 5m
				&& (differentialToFull.nrOfEntities() > 0)
			)
			logger.debug({
				req: reqForLogging,
				isHealthy,
			}, 'responding to health check')

			res.setHeader('cache-control', 'no-store')
			res.setHeader('expires', '0')
			res.setHeader('content-type', 'text/plain')
			// todo: respond with metrics used for health checking
			if (isHealthy === true) {
				res.statusCode = 200
				res.end('healthy!')
			} else {
				res.statusCode = 503
				res.end('not healthy :(')
			}
		} else if (path === '/feed_info.txt') {
			res.statusCode = 301
			res.setHeader('location', 'feed_info.csv')
			res.end()
		} else if (pathToStaticFeedInfo && path === '/feed_info.csv') {
			logger.debug({
				req: reqForLogging,
			}, 'serving feed_info')
			sendFile(req, pathToStaticFeedInfo).pipe(res)
		} else if (staticFeedUrl && path === '/gtfs-static') {
			res.statusCode = 302
			res.setHeader('location', staticFeedUrl)
			res.end(staticFeedUrl)
		} else {
			res.statusCode = 404
			res.end('nope')
		}
	}

	const cors = createCors()
	const server = createServer((req, res) => {
		cors(req, res, (err) => {
			if (err) {
				res.statusCode = err.statusCode || 500
				res.end(err + '')
				return;
			}
			onRequest(req, res)
		})
	})

	const port = parseInt(process.env.PORT || 3000)
	server.listen(port, (err) => {
		if (err) onError(err)
		else logger.info(`listening on port ${server.address().port}`)
	})

	withSoftExit(() => {
		server.close()
		natsStreaming.close()
	})
}

module.exports = serveGtfsRtViaHttp
