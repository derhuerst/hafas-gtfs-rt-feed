#!/usr/bin/env node

const {parse} = require('ndjson')

let nrOfEntities = 0
let matchedTripUpdates = 0
let matchedVehiclePositions = 0

const onRow = (ety) => {
	nrOfEntities++
	try {
		if (ety.vehicle) {
			// note: this is specific to HAFAS & the VBB GTFS
			const matched = !ety.vehicle.trip.trip_id.includes('|')
			if (matched) matchedVehiclePositions++
		} else if (ety.trip_update) {
			// note: this is specific to HAFAS & the VBB GTFS
			const matched = !ety.trip_update.trip.trip_id.includes('|')
			if (matched) matchedTripUpdates++
		} else throw new Error('entity has neither vehicle nor trip_update')
	} catch (err) {
		err.etyNr = nrOfEntities
		err.ety = ety
		console.error(err)
		throw err
	}
}

const onEnd = () => {
	console.log(JSON.stringify({
		nrOfEntities,
		matchedTripUpdates,
		matchedVehiclePositions,
	}))
	process.exit((
		nrOfEntities >= 670 && nrOfEntities <= 700
		&& matchedTripUpdates >= 280 && matchedTripUpdates <= 300
		&& matchedVehiclePositions > 370 && matchedVehiclePositions <= 400
	) ? 0 : 10)
}

process.stdin
.pipe(parse())
.on('data', onRow)
.once('end', onEnd)
.once('error', (err) => {
	console.error(err)
	process.exit(1)
})
