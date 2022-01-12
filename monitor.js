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
    monitor-hafas <path-to-hafas-client> [bbox]
Options:
    --movements-fetch-mode <mode>
        Control when movements are fetched from HAFAS.
        "on-demand":
            Only fetch movements from HAFAS when the \`serve-as-gtfs-rt\` component
            has signalled demand. Trips won't be fetched continuously anymore.
        "continuously" (default):
            Always fetch movements.
    --movements-demand-duration <milliseconds>
        With \`--movements-fetch-mode "on-demand"\`, when the \`serve-as-gtfs-rt\` component
        has signalled demand, for how long shall movements be fetched?
        Default: movements fetching interval (60s by default) * 5
    --trips-fetch-mode <mode>
        Control when trips are fetched from HAFAS.
        "never":
            Never fetch a movement's respective trip.
        "on-demand":
            Only fetch movements' respective trips from HAFAS when the \`serve-as-gtfs-rt\`
            component has signalled demand.
        "continuously" (default):
            Always fetch each movement's respective trip.
    --trips-demand-duration <milliseconds>
        With \`--trips-fetch-mode "on-demand"\`, when the \`serve-as-gtfs-rt\` component
        has signalled demand, for how long shall trips be fetched?
        Default: movements fetching interval (60s by default) * 2
Examples:
    monitor-hafas my-hafas-client.js -d trips '{"north": 1.1, "west": 22.2, "south": 3.3, "east": 33.3}'
\n`)
	process.exit(0)
}

if (argv.version || argv.v) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const {resolve: pathResolve} = require('path')
const runMonitor = require('./lib/monitor')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const pathToHafasClient = argv._[0]
if (!pathToHafasClient) showError('Missing path-to-hafas-client argument.')
const hafasClient = require(pathResolve(process.cwd(), pathToHafasClient))

const opt = {
	bbox: argv._[1] || JSON.parse(process.env.BBOX || 'null'),
}

if (argv['movements-fetch-mode']) {
	opt.movementsFetchMode = argv['movements-fetch-mode']
}
if (argv['movements-demand-duration']) {
	opt.movementsDemandDuration = parseInt(argv['movements-demand-duration'])
}
if (argv['trips-fetch-mode']) {
	opt.tripsFetchMode = argv['trips-fetch-mode']
}
if (argv['trips-demand-duration']) {
	opt.tripsDemandDuration = parseInt(argv['trips-demand-duration'])
}

runMonitor(hafasClient, opt)
