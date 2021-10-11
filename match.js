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
    match-with-gtfs <path-to-hafas-info> <path-to-gtfs-info> [options]
Options:
    --before-match-trip      Path to a hook function that modifies each trip
                             before it is being matched.
    --before-match-movement  Path to a hook function that modifies each movement
                             before it is being matched.
Examples:
    match-with-gtfs hafas-info.js gtfs-info.js
    match-with-gtfs hafas-info.js gtfs-info.js --before-match-movement fix-movement.js
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const {resolve: pathResolve} = require('path')
const runMatching = require('./lib/match')

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

const opt = {}

if (argv['before-match-trip']) {
	const p = argv['before-match-trip']
	opt.beforeMatchTrip = require(pathResolve(process.cwd(), p))
	if ('function' !== typeof opt.beforeMatchTrip) {
		showError('File specified by --before-match-trip does not export a function.')
	}
}

if (argv['before-match-movement']) {
	const p = argv['before-match-movement']
	opt.beforeMatchMovement = require(pathResolve(process.cwd(), p))
	if ('function' !== typeof opt.beforeMatchMovement) {
		showError('File specified by --before-match-movement does not export a function.')
	}
}

runMatching(hafasInfo, gtfsInfo, opt)
