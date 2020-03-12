'use strict'

const createHafas = require('bvg-hafas')
const createMonitor = require('hafas-monitor-trips')
const encodeChunks = require('length-prefixed-stream/encode')
const {inspect} = require('util')
const createGtfsRtFeed = require('.')

const potsdamerPlatz = {
	north: 52.52,
	west: 13.37,
	south: 52.5,
	east: 13.39
}
const centerOfBerlin = {
	north: 52.55,
	west: 13.31,
	south: 52.48,
	east: 13.48
}
const hafas = createHafas('hafas-gtfs-rt-feed example')
const monitor = createMonitor(hafas, centerOfBerlin, 20 * 1000)
// monitor.on('stats', (stats) => {
// 	console.error(stats)
// })

const feed = createGtfsRtFeed(monitor, {encodePbf: false})
feed.on('data', (msg) => {
	console.log(inspect(msg, {depth: null, colors: true}))
})
// const feed = createGtfsRtFeed(monitor)
// feed.pipe(encodeChunks()).pipe(process.stdout)

feed.once('error', (err) => {
	console.error(err)
	process.exit(1)
})
