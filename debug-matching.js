#!/usr/bin/env node
'use strict'

const mri = require('mri')
const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: [
		'help', 'h',
		'version', 'v',
		'match-trip-shapes',
	]
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    debug-gtfs-matching <path-to-hafas-info> <path-to-gtfs-info> [options] <trip|movement>
Options:
                             before it is being matched.
    --before-match           Path to a hook function that modifies each trip/movement
    --match-trip-shapes      Retrieve each trip's shape from the GTFS dataset.
Examples:
    match-with-gtfs hafas-info.js gtfs-info.js trip --before-match trim-trip.js <trip.json
    match-with-gtfs hafas-info.js gtfs-info.js movement <mv.json
Notes:
	Run with LOG_LEVEL=debug and optionally with DEBUG='match-gtfs-rt-to-gtfs*' to
	get more details on the matching process.
\n`)
	process.exit(0)
}

const {resolve: pathResolve} = require('path')
const createLogger = require('./lib/logger')
const withSoftExit = require('./lib/soft-exit')
const {
	createMatchWithGtfs,
	closeMatching,
} = require('./lib/raw-match')

const logger = createLogger('debug-matching')

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

let beforeMatchTrip = trip => trip
let beforeMatchMovement = mv => mv
if (argv['before-match']) {
	const p = argv['before-match']
	const beforeMatch = require(pathResolve(process.cwd(), p))
	if (mode === 'trip') beforeMatchTrip = beforeMatch
	else if (mode === 'movement') beforeMatchMovement = beforeMatch
	else showError('invalid mode')
}

const {
	matchTripWithGtfs,
	matchMovementWithGtfs,
} = createMatchWithGtfs({
	hafasInfo, gtfsInfo,
	beforeMatchTrip,
	beforeMatchMovement,
	matchTripPolylines: !!argv['match-trip-shapes'],
	logger,
})

let matchWithGtfs
if (mode === 'trip') {
	matchWithGtfs = matchTripWithGtfs
} else if (mode === 'movement') {
	matchWithGtfs = matchMovementWithGtfs
} else showError('invalid mode')

withSoftExit(closeMatching)

;(async () => {
	let item = ''
	for await (const chunk of process.stdin) item += chunk
	item = JSON.parse(item)

	const res = await matchWithGtfs(item)
	item = res.item
	const {isMatched, matchTime} = res

	if (isMatched === true) {
		console.error(`matched in ${matchTime}ms`)
		process.stdout.write(JSON.stringify(item) + '\n')
		process.exit(0)
	} else {
		console.error(`failed to match in ${matchTime}ms`)
		process.exit(1)
	}
})()
.catch(showError)
