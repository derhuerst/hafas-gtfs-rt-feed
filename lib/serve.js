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
const createLogger = require('./logger')
const {createMetricsServer, register} = require('./metrics')
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
	} = {
		feedId: process.env.FEED_ID || _natsId,
		natsStreamingUrl: process.env.NATS_STREAMING_URL || 'nats://localhost:4222',
		natsClusterId: process.env.NATS_CLUSTER_ID || 'test-cluster',
		natsClientId: process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-serve-${_natsId}`,
		natsClientName: process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-serve`,
		matchedMovementsChannel: process.env.MATCHED_MOVEMENTS_CHANNEL || 'matched-movements',
		matchedTripsChannel: process.env.MATCHED_TRIPS_CHANNEL || 'matched-trips',
		...opt,
	}

	const metricsServer = createMetricsServer()
	metricsServer.start().catch(onError)

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

	natsStreaming.once('connect', () => {
		const movSubOpts = subOpts()
		.setDurableName(`v${MAJOR_VERSION}-${feedId}-movements`)
		const movSub = natsStreaming.subscribe(matchedMovementsChannel, movSubOpts)
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
		const tripsSub = natsStreaming.subscribe(matchedTripsChannel, tripsSubOpts)
		tripsSub.on('message', (msg) => {
			const trip = JSON.parse(msg.getData())
			natsStreamingReceivedTotal.inc({channel: matchedTripsChannel})

			const t0 = performance.now()
			differentialToFull.write(formatTrip(trip))
			digestTime.observe({kind: 'trip'}, (performance.now() - t0) / 1000)

			msg.ack()
		})

		// todo: handle errors
	})

	let feed = Buffer.alloc(0)
	let timeModified = new Date()
	let etag = computeEtag(feed)
	differentialToFull.on('change', throttle(() => {
		feed = differentialToFull.asFeedMessage()
		timeModified = new Date()
		feedSize.set({compression: 'none'}, feed.length)
		etag = computeEtag(feed) // todo: add computation time as metric
	}, 100))

	const onRequest = (req, res) => {
		const path = new URL(req.url, 'http://localhost').pathname
		if (path === '/') {
			serveBuffer(req, res, feed, {
				timeModified, etag,
				gzipMaxSize: 20 * 1024 * 1024, // 20mb
				brotliCompressMaxSize: 1024 * 1024, // 1mb
				unmutatedBuffers: true,
			})
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
			} else {
				onRequest(req, res)
			}
		})
	})

	const port = parseInt(process.env.PORT || 3000)
	server.listen(port, onError)

	withSoftExit(() => {
		server.close()
		natsStreaming.close()
	})
}

module.exports = serveGtfsRtViaHttp
