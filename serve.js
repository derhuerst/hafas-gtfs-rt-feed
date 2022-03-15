#!/usr/bin/env node
'use strict'

const mri = require('mri')
const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: [
		'help', 'h',
		'version', 'v',
		'signal-demand', 'd',
	]
})

if (argv.help || argv.h) {
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

if (argv.version || argv.v) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const {accessSync, constants} = require('fs')
const serveGtfsRtViaHttp = require('./lib/serve')

// todo [breaking]: rename to --static-feed-info
const pathToStaticFeedInfo = argv['feed-info'] || argv['i'] || null
if (pathToStaticFeedInfo) {
	// check if file is readable
	accessSync(pathToStaticFeedInfo, constants.R_OK)
}

// todo [breaking]: rename to --static-feed-url
const staticFeedUrl = argv['feed-url'] || argv['u'] || null

const signalDemand = !!(argv['signal-demand'] || argv['d'])

serveGtfsRtViaHttp({
	pathToStaticFeedInfo,
	staticFeedUrl,
	signalDemand,
})
