'use strict'

const differentialToFullDataset = require('gtfs-rt-differential-to-full-dataset')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const throttle = require('lodash/throttle')
const computeEtag = require('etag')
const {gzipSync, brotliCompressSync} = require('zlib')
const serveBuffer = require('serve-buffer')
const createCors = require('cors')
const {createServer} = require('http')
const createLogger = require('./logger')
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
	const {
		clientId,
		natsStreamingUrl,
		natsClusterId,
		natsClientId,
		natsClientName,
		matchedMovementsChannel,
		matchedTripsChannel,
	} = {
		clientId: Math.random().toString(16).slice(2, 6),
		natsStreamingUrl: process.env.NATS_STREAMING_URL || 'nats://localhost:4222',
		natsClusterId: process.env.NATS_CLUSTER_ID || 'test-cluster',
		natsClientId: process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-serve-${clientId}`,
		natsClientName: process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-serve`,
		matchedMovementsChannel: process.env.MATCHED_MOVEMENTS_CHANNEL || 'matched-movements',
		matchedTripsChannel: process.env.MATCHED_TRIPS_CHANNEL || 'matched-trips',
		...opt,
	}

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
		const movSub = natsStreaming.subscribe(matchedMovementsChannel, subOpts())
		movSub.on('message', (msg) => {
			const movement = JSON.parse(msg.getData())
			differentialToFull.write(formatMovement(movement))
			msg.ack()
		})

		const tripsSub = natsStreaming.subscribe(matchedTripsChannel, subOpts())
		tripsSub.on('message', (msg) => {
			const trip = JSON.parse(msg.getData())
			differentialToFull.write(formatTrip(trip))
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
		etag = computeEtag(feed)
	}, 100))

	// note: this is assumes that `buf` is not mutated
	const compression = compress => {
		const cache = new WeakMap()
		return buf => {
			if (cache.has(buf)) return cache.get(buf)
			const compressedBuffer = compress(buf)
			const res = {
				compressedBuffer,
				compressedEtag: computeEtag(compressedBuffer),
			}
			cache.set(buf, res)
			return res
		}
	}

	const onRequest = (req, res) => {
		const path = new URL(req.url, 'http://localhost').pathname
		if (path === '/') {
			serveBuffer(req, res, feed, {
				timeModified, etag,
				gzip: compression(gzipSync),
				brotliCompress: compression(brotliCompressSync),
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
