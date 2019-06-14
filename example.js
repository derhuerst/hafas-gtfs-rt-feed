'use strict'

const createHafas = require('bvg-hafas')
const createMonitor = require('hafas-monitor-trips')
const encodeChunks = require('length-prefixed-stream/encode')
const {inspect} = require('util')
const createGtfsRtFeed = require('.')

const hafas = createHafas('vbb-gtfs-rt-feed example')
const monitor = createMonitor(hafas, {
	north: 52.52,
	west: 13.36,
	south: 52.5,
	east: 13.39
})

const feed = createGtfsRtFeed(monitor)
feed.pipe(encodeChunks()).pipe(process.stdout)

// const feed = createGtfsRtFeed(monitor, {debug: true})
// feed.on('data', (msg) => {
// 	console.log(inspect(msg, {depth: null, colors: true}))
// })

feed.once('error', (err) => {
	console.error(err)
	process.exit(1)
})
