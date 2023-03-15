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
        'movements-fetch-mode': {
            type: 'string',
        },
        'movements-fetch-interval-fn': {
            type: 'string',
        },
        'movements-demand-duration': {
            type: 'string',
        },
        'trips-fetch-mode': {
            type: 'string',
        },
        'trips-demand-duration': {
            type: 'string',
        },
    },
    allowPositionals: true,
})

if (flags.help) {
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
    --movements-fetch-interval-fn
        Path to a file exporting a function that returns the milliseconds that all movements
        should be fetched again after.
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

if (flags.version) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

const {resolve: pathResolve} = require('path')
const {types: {isModuleNamespaceObject}} = require('util')
const runMonitor = require('./lib/monitor')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

;(async () => {

const pathToHafasClient = args[0]
if (!pathToHafasClient) showError('Missing path-to-hafas-client argument.')
let hafasClient = await import(pathResolve(process.cwd(), pathToHafasClient))
// handle CommonJS modules & default exports
if (isModuleNamespaceObject(hafasClient)) hafasClient = hafasClient.default

const opt = {
	bbox: JSON.parse(args[1] || process.env.BBOX || 'null'),
}

if (flags['movements-fetch-mode']) {
	opt.movementsFetchMode = flags['movements-fetch-mode']
}
if (flags['movements-fetch-interval-fn']) {
	const p = flags['movements-fetch-interval-fn']
	opt.fetchTilesInterval = await import(pathResolve(process.cwd(), p))
	// handle CommonJS modules & default exports
	if (isModuleNamespaceObject(opt.fetchTilesInterval)) {
		opt.fetchTilesInterval = opt.fetchTilesInterval.default
	}
	if ('function' !== typeof opt.fetchTilesInterval) {
		showError('File specified by --movements-fetch-interval-fn does not export a function.')
	}
}
if (flags['movements-demand-duration']) {
	opt.movementsDemandDuration = parseInt(flags['movements-demand-duration'])
}
if (flags['trips-fetch-mode']) {
	opt.tripsFetchMode = flags['trips-fetch-mode']
}
if (flags['trips-demand-duration']) {
	opt.tripsDemandDuration = parseInt(flags['trips-demand-duration'])
}

runMonitor(hafasClient, opt)

})()
.catch(showError)
