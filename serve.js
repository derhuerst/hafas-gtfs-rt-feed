#!/usr/bin/env node
'use strict'

const mri = require('mri')
const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: [
		'help', 'h',
		'version', 'v',
	]
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    serve-as-gtfs-rt
Examples:
    serve-as-gtfs-rt
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const differentialToFullDataset = require('gtfs-rt-differential-to-full-dataset')
const {connect: connectToNatsStreaming} = require('node-nats-streaming')
const computeEtag = require('etag')
const {gzipSync, brotliCompressSync} = require('zlib')
const serveBuffer = require('serve-buffer')
const createCors = require('cors')
const {createServer} = require('http')
const createLogger = require('./lib/logger')
const createGtfsRtWriter = require('./lib/gtfs-rt-writer')
const withSoftExit = require('./lib/soft-exit')

const MAJOR_VERSION = require('./lib/major-version')

const logger = createLogger('serve')

const onError = (err) => {
	if (!err) return;
	logger.error(err)
	process.exit(1)
}

const {
	formatTrip, formatMovement,
} = createGtfsRtWriter()

const differentialToFull = differentialToFullDataset({
	ttl: 5 * 60 * 1000, // 5m
})

const clientId = Math.random().toString(16).slice(2, 6)
const natsStreamingUrl = process.env.NATS_STREAMING_URL || 'nats://localhost:4222'
const natsClusterId = process.env.NATS_CLUSTER_ID || 'test-cluster'
const natsClientId = process.env.NATS_CLIENT_ID || `v${MAJOR_VERSION}-serve-${clientId}`
const natsClientName = process.env.NATS_CLIENT_NAME || `v${MAJOR_VERSION}-serve`

const natsStreaming = connectToNatsStreaming(natsClusterId, natsClientId, {
	url: natsStreamingUrl,
	name: natsClientName,
})

const subOpts = () => {
	return natsStreaming.subscriptionOptions()
	.setMaxInFlight(300) // todo
}

natsStreaming.once('connect', () => {
	const movSub = natsStreaming.subscribe('matched-movements', subOpts())
	movSub.on('message', (msg) => {
		const movement = JSON.parse(msg.getData())
		differentialToFull.write(formatMovement(movement))
		msg.ack()
	})

	const tripsSub = natsStreaming.subscribe('matched-trips', subOpts())
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
// todo: debounce this
differentialToFull.on('change', () => {
	feed = differentialToFull.asFeedMessage()
	timeModified = new Date()
	etag = computeEtag(feed)
})

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
server.listen(3000, onError)

withSoftExit(() => {
	server.close()
	natsStreaming.close()
})
