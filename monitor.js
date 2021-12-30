#!/usr/bin/env node
'use strict'

const mri = require('mri')
const pkg = require('./package.json')

const argv = mri(process.argv.slice(2), {
	boolean: [
		'help', 'h',
		'version', 'v',
		'on-demand', 'd',
	]
})

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    monitor-hafas <path-to-hafas-client> [bbox]
Options:
    --on-demand      -d  Only fetch data from HAFAS as long as the serve component
                         signal demand for it.
Examples:
    monitor-hafas my-hafas-client.js '{"north": 1.1, "west": 22.2, "south": 3.3, "east": 33.3}'
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

const onDemand = !!(argv['on-demand'] || argv['d'])

runMonitor(hafasClient, {
	bbox: argv._[1] || JSON.parse(process.env.BBOX || 'null'),
	onDemand,
})
