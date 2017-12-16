'use strict'

const monitor = require('vbb-monitor')
const ws = require('ws')

const convertToGtfsRt = require('.')

const stations = ['900000003201', '900000100001'] // array of station ids
const interval = 5 * 1000 // every 10 seconds

const updates = monitor(stations, interval)
.on('error', console.error)
.pipe(convertToGtfsRt())
.on('error', console.error)

const wsServer = new ws.Server({
	port: 3000,
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'http://localhost:3000',
		'Access-Control-Allow-Methods': 'PUT, GET, POST, DELETE, OPTIONS'
	}
})
wsServer.on('connection', (connection) => {
	const onOpen = () => {
		const onData = u => connection.send(u)
		updates.once('close', () => {
			updates.removeListener('data', onData)
		})
		updates.on('data', onData)
	}

	if (connection.readyState === connection.OPEN) onOpen()
	else connection.once('open', onOpen)
})
