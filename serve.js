#!/usr/bin/env node
'use strict'

const {parseArgs} = require('util')
const pkg = require('./package.json')

const {
	values: flags,
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
		'feed-info': {
			type: 'string',
			short: 'i',
		},
		'feed-url': {
			type: 'string',
			short: 'u',
		},
		'signal-demand': {
			type: 'boolean',
			short: 'd',
		},
	},
})

if (flags.help) {
	process.stdout.write(`
Usage:
    serve-as-gtfs-rt
Options:
    --feed-info         -i  Path to GTFS-Static feed_info.txt file.
    --feed-url          -u  Direct download URL of the GTFS-Static feed used.
    --signal-demand     -d  Signal demand in fresh data to the monitor component.
Examples:
    serve-as-gtfs-rt
\n`)
	process.exit(0)
}

if (flags.version) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const {accessSync, constants} = require('fs')
const serveGtfsRtViaHttp = require('./lib/serve')

// todo [breaking]: rename to --static-feed-info
const pathToStaticFeedInfo = flags['feed-info'] || null
if (pathToStaticFeedInfo) {
	// check if file is readable
	accessSync(pathToStaticFeedInfo, constants.R_OK)
}

// todo [breaking]: rename to --static-feed-url
const staticFeedUrl = flags['feed-url'] || null

const signalDemand = !!flags['signal-demand']

serveGtfsRtViaHttp({
	pathToStaticFeedInfo,
	staticFeedUrl,
	signalDemand,
})
