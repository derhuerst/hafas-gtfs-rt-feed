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
    serve-as-gtfs-rt
Options:
    --static-feed-info  -i  Path to GTFS-Static feed_info.txt file.
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

const pathToStaticFeedInfo = argv['feed-info'] || argv['i'] || null
if (pathToStaticFeedInfo) {
	// check if file is readable
	accessSync(pathToStaticFeedInfo, constants.R_OK)
}

serveGtfsRtViaHttp({
	pathToStaticFeedInfo,
})
