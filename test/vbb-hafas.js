'use strict'

const withThrottling = require('hafas-client/throttle')
const vbbProfile = require('hafas-client/p/vbb')
const createHafas = require('hafas-client')

const throttledProfile = withThrottling(vbbProfile, 10, 1000) // 10 req/s
const hafas = createHafas(throttledProfile, 'hafas-gtfs-rt-feed test')

module.exports = hafas
