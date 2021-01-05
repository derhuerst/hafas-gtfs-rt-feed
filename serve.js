'use strict'

const differentialToFullDataset = require('gtfs-rt-differential-to-full-dataset')
const {pipeline, Transform} = require('stream')
const {parse: parseNdjson} = require('ndjson')
const computeEtag = require('etag')
const {gzipSync, brotliCompressSync} = require('zlib')
const serveBuffer = require('serve-buffer')
const createCors = require('cors')
const {createServer} = require('http')
const createLogger = require('./lib/logger')
const createGtfsRtWriter = require('./lib/gtfs-rt-writer')
const {POSITION, TRIP} = require('./lib/protocol')

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

pipeline(
	process.stdin,
	parseNdjson(),
	new Transform({
		objectMode: true,
		transform: (item, _, cb) => {
			if (item[0] === POSITION) {
				cb(null, formatMovement(item[2]))
			} else if (item[0] === TRIP) {
				cb(null, formatTrip(item[1]))
			} else {
				logger.warn('invalid/unknown item', item)
				cb(null)
			}
		},
	}),
	differentialToFull,
	onError,
)

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
createServer((req, res) => {
	cors(req, res, (err) => {
		if (err) {
			res.statusCode = err.statusCode || 500
			res.end(err + '')
		} else {
			onRequest(req, res)
		}
	})
})
.listen(3000, onError)
