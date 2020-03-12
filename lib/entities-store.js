'use strict'

const {strictEqual} = require('assert')
const schema = require('gtfs-rt-bindings/schema.json')
const {varint} = require('protocol-buffers-encodings')
const {FeedEntity, FeedHeader, FeedMessage} = require('gtfs-rt-bindings')

const bufEqual = (actual, expected, msg = undefined) => {
	strictEqual(actual.toString('hex'), expected.toString('hex'), msg)
}

const gtfsRt = schema.nested.transit_realtime.nested
const feedMsgFields = gtfsRt.FeedMessage.fields
const FEED_MSG_HEADER = feedMsgFields.header.id
const FEED_MSG_ENTITIES = feedMsgFields.entity.id

// https://developers.google.com/protocol-buffers/docs/encoding#structure
const LENGTH_DELIMITED = 2

// https://developers.google.com/protocol-buffers/docs/encoding#structure
const encodeField = (fieldNumber, wireType, dataLength) => {
	// If I'm not wrong, 4 bytes of varint allow for 268.435.456b
	// ~= 217mb of (payload) data.
	const buf = Buffer.allocUnsafeSlow(1 + 4)
	let offset = 0
	buf[offset++] = (fieldNumber << 3 | wireType)
	varint.encode(dataLength, buf, offset)
	offset += varint.encode.bytes
	return buf.slice(0, offset)
}
bufEqual(encodeField(1, 2, 123456), Buffer.from([10, 192, 196, 7]))

// todo: move this into an npm package
const createEntitiesStore = (opt = {}) => {
	const {
		ttl,
	} = {
		ttl: 5 * 60 * 1000, // 5 minutes
		...opt
	}

	let timers = new Map()
	let datas = new Map()
	let fields = new Map()
	let cache = null // cached final `FeedMessage` buffer

	const del = (id) => {
		if (!timers.has(id)) return;
		clearTimeout(timers.get(id))
		timers.delete(id)
		datas.delete(id)
		fields.delete(id)
		cache = null
	}

	const put = (id, entity) => {
		del(id)
		cache = null

		// todo: use sth more memory-efficient than closures?
		timers.set(id, setTimeout(() => {
			remove(id)
		}, ttl))

		const data = FeedEntity.encode(entity)
		datas.set(id, data)

		const field = encodeField(
			FEED_MSG_ENTITIES,
			LENGTH_DELIMITED,
			data.length
		)
		fields.set(id, field)
	}

	const flush = () => {
		for (const timer of timers.values()) clearTimeout(timer)
		timers = new Map()
		datas = new Map()
		fields = new Map()
		cache = null
	}

	const nrOfEntities = () => timers.size

	const asFeedMessage = () => {
		if (cache !== null) return cache

		const ids = Array.from(timers.keys())
		const chunks = new Array(2 + ids.length * 2)

		const header = chunks[1] = FeedHeader.encode({
			gtfs_realtime_version: '2.0',
			incrementality: FeedHeader.Incrementality.DIFFERENTIAL,
			timestamp: Date.now() / 1000 | 0,
		})
		const headerField = chunks[0] = encodeField(
			FEED_MSG_HEADER,
			LENGTH_DELIMITED,
			header.length
		)

		let bytes = headerField.length + header.length
		for (let i = 0; i < ids.length; i++) {
			const id = ids[i]
			const field = fields.get(id)
			const data = datas.get(id)

			chunks[2 + i * 2] = field
			chunks[2 + i * 2 + 1] = data
			bytes += field.length + data.length
		}

		// We might be able to optimize this with a an array of slices
		// from a buffer pool.
		// todo: implement it, benchmark it
		cache = Buffer.concat(chunks, bytes)
		return cache
	}

	return {
		put,
		del,
		flush,
		nrOfEntities,
		asFeedMessage,
	}
}

// test

const e1 = {
	id: '1',
	vehicle: {
		trip: {trip_id: '1|30532|17|86|12032020', route_id: 'm10'},
		vehicle: {id: null, label: 'S+U Warschauer Str.'},
		position: {latitude: 52.531513, longitude: 13.38741},
		stop_id: '900000007104',
		current_status: 2
	}
}
const e2 = {
	id: '2',
	vehicle: {
		trip: {trip_id: '1|22921|5|86|12032020', route_id: 'm41'},
		vehicle: {id: null, label: 'Sonnenallee/Baumschulenstr.'},
		position: {latitude: 52.497561, longitude: 13.394512},
		stop_id: '900000012152',
		current_status: 2
	}
}
const e3 = {
	id: '130',
	vehicle: {
		trip: {trip_id: '1|33296|7|86|12032020', route_id: 'u3'},
		vehicle: {id: null, label: 'U Gleisdreieck'},
		position: {latitude: 52.498658, longitude: 13.35797},
		stop_id: '900000056104',
		current_status: 2
	}
}

const header = {
	gtfs_realtime_version: '2.0',
	incrementality: FeedHeader.Incrementality.DIFFERENTIAL,
	timestamp: Date.now() / 1000 | 0, // this will fail every 1/1000th time
}
const feedMsgEqual = (store, entities) => {
	const actual = s.asFeedMessage()
	const expected = FeedMessage.encode({header, entity: entities})
	bufEqual(actual, expected)
}

const s = createEntitiesStore()
s.put('foo', e1)
s.put('bar', e2)
feedMsgEqual(s, [e1, e2])
s.put('baz', e3)
feedMsgEqual(s, [e1, e2, e3])
s.put('foo', e3)
feedMsgEqual(s, [e2, e3, e3])
s.del('bar')
feedMsgEqual(s, [e3, e3])
s.flush()
feedMsgEqual(s, [])

module.exports = createEntitiesStore
