'use strict'

const runGtfsMatching = require('../match')
const gtfsRtInfo = require('./gtfs-rt-info')
const gtfsInfo = require('./gtfs-info')

runGtfsMatching(gtfsRtInfo, gtfsInfo)
