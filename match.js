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
		'before-match-trip': {
			type: 'string',
		},
		'before-match-movement': {
			type: 'string',
		},
	},
	allowPositionals: true,
})

if (flags.help) {
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

if (flags.version) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const {resolve: pathResolve} = require('path')
const {types: {isModuleNamespaceObject}} = require('util')
const runMatching = require('./lib/match')

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

const opt = {}

if (flags['before-match-trip']) {
	const p = flags['before-match-trip']
	opt.beforeMatchTrip = require(pathResolve(process.cwd(), p))
	if ('function' !== typeof opt.beforeMatchTrip) {
		showError('File specified by --before-match-trip does not export a function.')
	}
}

if (flags['before-match-movement']) {
	const p = flags['before-match-movement']
	opt.beforeMatchMovement = require(pathResolve(process.cwd(), p))
	if ('function' !== typeof opt.beforeMatchMovement) {
		showError('File specified by --before-match-movement does not export a function.')
	}
}

runMatching(hafasInfo, gtfsInfo, opt)

})()
.catch(showError)
