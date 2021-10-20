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
    debug-gtfs-matching <path-to-hafas-info> <path-to-gtfs-info> <trip|movement> <data
Examples:
    match-with-gtfs hafas-info.js gtfs-info.js trip <trip.json
    match-with-gtfs hafas-info.js gtfs-info.js movement <mv.json
\n`)
	process.exit(0)
}

const {resolve: pathResolve} = require('path')
const {createMatchTrip, createMatchMovement} = require('match-gtfs-rt-to-gtfs')
const withSoftExit = require('./lib/soft-exit')

const MATCHED = Symbol.for('match-gtfs-rt-to-gtfs:matched')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const pathToHafasInfo = argv._[0]
if (!pathToHafasInfo) showError('Missing path-to-hafas-info argument.')
const hafasInfo = require(pathResolve(process.cwd(), pathToHafasInfo))

const pathToGtfsInfo = argv._[1]
if (!pathToGtfsInfo) showError('Missing path-to-gtfs-info argument.')
const gtfsInfo = require(pathResolve(process.cwd(), pathToGtfsInfo))

const mode = argv._[2]
let matchWithGtfs
if (mode === 'trip') {
	matchWithGtfs = createMatchTrip(hafasInfo, gtfsInfo)
} else if (mode === 'movement') {
	matchWithGtfs = createMatchMovement(hafasInfo, gtfsInfo)
} else showError('invalid mode')

;(async () => {
	let item = ''
	for await (const chunk of process.stdin) item += chunk
	item = JSON.parse(item)

	const t1 = Date.now()
	item = await matchWithGtfs(item)
	const matchTime = Date.now() - t1

	if (item[MATCHED] === true) {
		console.info(`matched in ${matchTime}ms`)
		process.exit(0)
	} else {
		console.error(`failed to match in ${matchTime}ms`)
		process.exit(1)
	}
})()
.catch(showError)
