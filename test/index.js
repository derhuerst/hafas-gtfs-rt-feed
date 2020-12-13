'use strict'

const test = require('tape')
const {VehiclePosition} = require('gtfs-rt-bindings')
const {
	formatStopTimeUpdate,
	formatTripUpdate,
	formatVehiclePosition,
} = require('../lib/format')

const hvvRe70Trip = require('./fixtures/trip-re70-2020-11-29.json')
const hvvU1Trip = require('./fixtures/trip-u1-2020-11-29.json')
const hvvU3Movement = require('./fixtures/movement-u3-2020-12-01.json')

const {STOPPED_AT, IN_TRANSIT_TO} = VehiclePosition.VehicleStopStatus

test('formatStopTimeUpdate prefers a `gtfs` id', (t) => {
	const gtfsRt = formatStopTimeUpdate({
		stop: {
			id: 'bar',
			ids: {gtfs: 'foo'},
		},
	})
	t.equal(gtfsRt.stop_id, 'foo')
	t.end()
})

test('formatTripUpdate works with HVV RE70', (t) => {
	const gtfsRt = formatTripUpdate(hvvRe70Trip)
	t.deepEqual(gtfsRt, {
		trip: {
			trip_id: '1|33779|0|80|29112020',
			route_id: 'z-re70',
			start_time: '22:22:00',
			start_date: '20201129',
		},
		vehicle: {id: '41395', label: 'Kiel Hbf'},
		stop_time_update: [{
			stop_id: '21132',
			arrival: {time: null, delay: null},
			departure: {time: 1606684920, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '51666',
			arrival: {time: 1606685100, delay: 0},
			departure: {time: 1606685160, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '51552',
			arrival: {time: 1606686420, delay: 0},
			departure: {time: 1606686480, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '21333',
			arrival: {time: 1606687200, delay: 0},
			departure: {time: 1606687260, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '21079',
			arrival: {time: 1606687560, delay: 0},
			departure: {time: 1606687620, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '51588',
			arrival: {time: 1606688220, delay: 0},
			departure: {time: 1606688280, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '21072',
			arrival: {time: 1606688700, delay: 0},
			departure: {time: 1606688760, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '51570',
			arrival: {time: 1606689480, delay: 0},
			departure: {time: null, delay: null},
			schedule_relationship: 0,
		}]
	})
	t.end()
})

test('formatTripUpdate works with HVV U1', (t) => {
	const gtfsRt = formatTripUpdate(hvvU1Trip)
	t.deepEqual(gtfsRt, {
		trip: {
			trip_id: '1|13672|1|80|29112020',
			route_id: 'hha-b-911',
			start_time: '23:17:00',
			start_date: '20201129',
		},
		vehicle: {id: '76815', label: 'Ochsenzoll'},
		stop_time_update: [{
			stop_id: '16413',
			arrival: {time: null, delay: null},
			departure: {time: 1606688220, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16411',
			arrival: {time: 1606688340, delay: 0},
			departure: {time: 1606688340, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16379',
			arrival: {time: 1606688460, delay: 0},
			departure: {time: 1606688460, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '98093',
			arrival: {time: 1606688580, delay: 0},
			departure: {time: 1606688580, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16369',
			arrival: {time: 1606688700, delay: 0},
			departure: {time: 1606688700, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16371',
			arrival: {time: 1606688820, delay: 0},
			departure: {time: 1606688820, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16373',
			arrival: {time: 1606689000, delay: 0},
			departure: {time: 1606689000, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16349',
			arrival: {time: 1606689120, delay: 0},
			departure: {time: 1606689120, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16351',
			arrival: {time: 1606689180, delay: 0},
			departure: {time: 1606689180, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16353',
			arrival: {time: 1606689360, delay: 0},
			departure: {time: 1606689360, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16355',
			arrival: {time: 1606689420, delay: 0},
			departure: {time: 1606689420, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16357',
			arrival: {time: 1606689480, delay: 0},
			departure: {time: 1606689480, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16267',
			arrival: {time: 1606689600, delay: 0},
			departure: {time: 1606689600, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16271',
			arrival: {time: 1606689720, delay: 0},
			departure: {time: 1606689720, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16273',
			arrival: {time: 1606689780, delay: 0},
			departure: {time: 1606689780, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16279',
			arrival: {time: 1606689960, delay: 0},
			departure: {time: 1606689960, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16283',
			arrival: {time: 1606690020, delay: 0},
			departure: {time: 1606690020, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16298',
			arrival: {time: 1606690080, delay: 0},
			departure: {time: 1606690080, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16296',
			arrival: {time: 1606690200, delay: 0},
			departure: {time: 1606690200, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16294',
			arrival: {time: 1606690320, delay: 0},
			departure: {time: 1606690320, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16292',
			arrival: {time: 1606690440, delay: 0},
			departure: {time: 1606690440, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16458',
			arrival: {time: 1606690560, delay: 0},
			departure: {time: 1606690560, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16456',
			arrival: {time: 1606690680, delay: 0},
			departure: {time: 1606690680, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16454',
			arrival: {time: 1606690740, delay: 0},
			departure: {time: 1606690740, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16452',
			arrival: {time: 1606690860, delay: 0},
			departure: {time: 1606690860, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16450',
			arrival: {time: 1606690980, delay: 0},
			departure: {time: 1606690980, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16448',
			arrival: {time: 1606691040, delay: 0},
			departure: {time: 1606691040, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16468',
			arrival: {time: 1606691220, delay: 0},
			departure: {time: 1606691220, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16408',
			arrival: {time: 1606691280, delay: 0},
			departure: {time: 1606691280, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16406',
			arrival: {time: 1606691340, delay: 0},
			departure: {time: 1606691340, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16404',
			arrival: {time: 1606691460, delay: 0},
			departure: {time: 1606691460, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16486',
			arrival: {time: 1606691580, delay: 0},
			departure: {time: 1606691580, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16484',
			arrival: {time: 1606691700, delay: 0},
			departure: {time: 1606691700, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16482',
			arrival: {time: 1606691820, delay: 0},
			departure: {time: 1606691820, delay: 0},
			schedule_relationship: 0,
		}, {
			stop_id: '16480',
			arrival: {time: 1606691940, delay: 0},
			departure: {time: null, delay: null},
			schedule_relationship: 0,
		}]
	})
	t.end()
})

test('formatVehiclePosition works with HVV U3', (t) => {
	const gtfsRt = formatVehiclePosition(hvvU3Movement)
	t.deepEqual(gtfsRt, {
		trip: {trip_id: '1|38094|22|80|1122020', route_id: 'hha-u-u3'},
		vehicle: {id: null, label: 'Schlump - Barmbek'},
		position: {latitude: 53.564607, longitude: 10.026802},
		stop_id: null,
		current_status: null,
	})
	t.end()
})

test('formatVehiclePosition computes stop_id & current_status correctly', (t) => {
	const wandsbekGartenstadt = '16375'
	const uhlandstr = '16265'
	const lübeckerStr = '16269'
	const barmbek = '16395'
	const withNow = now => formatVehiclePosition(hvvU3Movement, {now})

	const beforeWandsbekDep = withNow(Date.parse('2020-12-01T13:03:00+01:00'))
	t.equal(beforeWandsbekDep.stop_id, wandsbekGartenstadt, 'beforeWandsbekDep.stop_id')
	t.equal(beforeWandsbekDep.current_status, STOPPED_AT, 'beforeWandsbekDep.current_status')
	const atWandsbekDep = withNow(Date.parse('2020-12-01T13:06:00+01:00'))
	t.equal(atWandsbekDep.stop_id, wandsbekGartenstadt, 'atWandsbekDep.stop_id')
	t.equal(atWandsbekDep.current_status, STOPPED_AT, 'atWandsbekDep.current_status')

	const afterWandsbekDep = withNow(Date.parse('2020-12-01T13:06:01+01:00'))
	t.equal(afterWandsbekDep.stop_id, uhlandstr, 'afterWandsbekDep.stop_id')
	t.equal(afterWandsbekDep.current_status, IN_TRANSIT_TO, 'afterWandsbekDep.current_status')
	const beforeUhlandstrArr = withNow(Date.parse('2020-12-01T13:16:01+01:00'))
	t.equal(beforeUhlandstrArr.stop_id, uhlandstr, 'beforeUhlandstrArr.stop_id')
	t.equal(beforeUhlandstrArr.current_status, IN_TRANSIT_TO, 'beforeUhlandstrArr.current_status')
	const atUhlandstrArr = withNow(Date.parse('2020-12-01T13:17:00+01:00'))
	t.equal(atUhlandstrArr.stop_id, uhlandstr, 'atUhlandstrArr.stop_id')
	t.equal(atUhlandstrArr.current_status, STOPPED_AT, 'atUhlandstrArr.current_status')
	const atUhlandstrDep = withNow(Date.parse('2020-12-01T13:18:00+01:00'))
	t.equal(atUhlandstrDep.stop_id, uhlandstr, 'atUhlandstrDep.stop_id')
	t.equal(atUhlandstrDep.current_status, STOPPED_AT, 'atUhlandstrDep.current_status')

	const afterUhlandstrDep = withNow(Date.parse('2020-12-01T13:18:01+01:00'))
	t.equal(afterUhlandstrDep.stop_id, lübeckerStr, 'afterUhlandstrDep.stop_id')
	t.equal(afterUhlandstrDep.current_status, IN_TRANSIT_TO, 'afterUhlandstrDep.current_status')

	const afterBarmbek = withNow(Date.parse('2020-12-01T13:51:00+01:00'))
	t.equal(afterBarmbek.stop_id, null, 'afterBarmbek.stop_id')
	t.equal(afterBarmbek.current_status, null, 'afterBarmbek.current_status')

	t.end()
})

test('formatTripUpdate prefers `gtfs` ids', (t) => {
	const base = {
		id: 'some-trip-id',
		routeId: 'some-route-id',
		stopovers: [],
	}

	const r1 = formatTripUpdate({
		...base,
		ids: {gtfs: 'a'},
	})
	t.equal(r1.trip.trip_id, 'a', 'r1.trip.trip_id')
	t.equal(r1.trip.route_id, 'some-route-id', 'r1.trip.route_id')

	const r2 = formatTripUpdate({
		...base,
		routeId: null,
		line: {ids: {gtfs: 'b'}},
	})
	t.equal(r2.trip.trip_id, 'some-trip-id', 'r2.trip.trip_id')
	t.equal(r2.trip.route_id, 'b', 'r2.trip.route_id')

	const r3 = formatTripUpdate({
		...base,
		ids: {gtfs: 'c'},
		routeId: null,
		line: {ids: {gtfs: 'd'}},
	})
	t.equal(r3.trip.trip_id, 'c', 'r3.trip.trip_id')
	t.equal(r3.trip.route_id, 'd', 'r3.trip.route_id')

	t.end()
})
