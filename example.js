'use strict'

const monitor = require('vbb-monitor')

const convertToGtfsRt = require('.')

const stations = ['900000100003'] // array of station ids
const interval = 10 * 1000 // every 10 seconds
monitor(stations, interval)
.on('error', console.error)
.pipe(convertToGtfsRt())
.on('error', console.error)
.on('data', console.log)
