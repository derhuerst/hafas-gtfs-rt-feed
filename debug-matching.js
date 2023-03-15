#!/usr/bin/env node
'use strict'

const {parseArgs} = require('util')
const pkg = require('./package.json')

const {
	values: flags,
	positionals: args,
} = parseArgs({
	options: {
		'help': {
			type: 'boolean',
			short: 'h',
		},
		'version': {
			type: 'boolean',
			short: 'v',
		},
		'before-match': {
			type: 'string',
		},
		'match-trip-shapes': {
			type: 'boolean',
		},
	},
	allowPositionals: true,
})

if (flags.help) {
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

if (flags.version) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const {resolve: pathResolve} = require('path')
const {types: {isModuleNamespaceObject}} = require('util')
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

;(async () => {

const pathToHafasInfo = args[0]
if (!pathToHafasInfo) showError('Missing path-to-hafas-info argument.')
let hafasInfo = await import(pathResolve(process.cwd(), pathToHafasInfo))
// handle CommonJS modules & default exports
if (isModuleNamespaceObject(hafasInfo)) hafasInfo = hafasInfo.default

const pathToGtfsInfo = args[1]
if (!pathToGtfsInfo) showError('Missing path-to-gtfs-info argument.')
let gtfsInfo = await import(pathResolve(process.cwd(), pathToGtfsInfo))
// handle CommonJS modules & default exports
if (isModuleNamespaceObject(gtfsInfo)) gtfsInfo = gtfsInfo.default

const mode = args[2]

let beforeMatchTrip = trip => trip
let beforeMatchMovement = mv => mv
if (flags['before-match']) {
	const p = flags['before-match']
	let beforeMatch = await import(pathResolve(process.cwd(), p))
	// handle CommonJS modules & default exports
	if (isModuleNamespaceObject(beforeMatch)) beforeMatch = beforeMatch.default
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
	matchTripPolylines: !!flags['match-trip-shapes'],
	logger,
})

let matchWithGtfs
if (mode === 'trip') {
	matchWithGtfs = matchTripWithGtfs
} else if (mode === 'movement') {
	matchWithGtfs = matchMovementWithGtfs
} else showError('invalid mode')

withSoftExit(closeMatching)

	let item = ''
	for await (const chunk of process.stdin) item += chunk
	item = JSON.parse(item)

	const waitTime = 0 // we didn't wait for anything, this is a debug script
	const res = await matchWithGtfs(item, waitTime)
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
