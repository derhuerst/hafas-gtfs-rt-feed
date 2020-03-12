'use strict'

const createHafas = require('bvg-hafas')
const createMonitor = require('hafas-monitor-trips')
const encodeChunks = require('length-prefixed-stream/encode')
const {inspect} = require('util')
const createGtfsRtFeed = require('.')
const gtfsRtAsDump = require('./as-dump')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

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

// unencoded "differential feed"
const feed = createGtfsRtFeed(monitor, {encodePbf: false})
feed.once('error', showError)
feed.on('data', (feedEntity) => {
	console.log(inspect(feedEntity, {depth: null, colors: true}))
})

// PBF-encoded "differential feed"
// const feed = createGtfsRtFeed(monitor)
// feed.once('error', showError)
// feed.pipe(encodeChunks()).pipe(process.stdout)

// PBF-encoded "full dump"
// const asDump = gtfsRtAsDump()
// asDump.once('error', showError)

// feed.pipe(asDump)
// setInterval(() => {
// 	console.log(asDump.getDump())
// }, 5000)
