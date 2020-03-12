'use strict'

const {strictEqual: eql} = require('assert')

const TTL = 5 * 60 * 1000 // 5 minutes

const createBufferStore = (ttl = TTL) => {
	let timers = new Map()
	let bufs = new Map()
	// All buffers concatenated. We sacrife memory for asBuffer()
	// performance.
	let concatenated = Buffer.alloc(0)

	const get = (id) => {
		if (!timers.has(id)) return null
		return bufs.get(id)
	}

	const put = (id, buf) => {
		if (timers.has(id)) {
			clearTimeout(timers.get(id))
			// If there was an item for `id` before, we're replacing
			// instead of appending, so we clear the cached concatenated
			// buffer.
			concatenated = null
		}

		// todo: find sth more memory-efficient than closures
		timers.set(id, setTimeout(() => {
			timers.delete(id)
			bufs.delete(id)
		}, ttl))

		bufs.set(id, buf)
		if (concatenated) {
			concatenated = Buffer.concat([concatenated, buf])
		}
	}

	const del = (id) => {
		if (!timers.has(id)) return;
		clearTimeout(timers.get(id))
		timers.delete(id)
		bufs.delete(id)
		concatenated = null
	}

	const flush = () => {
		for (const id of timers.keys()) {
			clearTimeout(timers.get(id))
		}
		timers = new Map()
		bufs = new Map()
		concatenated = null
	}

	const keys = () => bufs.keys()
	const values = () => bufs.values()

	const asBuffer = () => {
		if (!concatenated) {
			concatenated = Buffer.concat(Array.from(values()))
		}
		return concatenated
	}

	return {
		put,
		del,
		flush,
		keys,
		values,
		asBuffer,
	}
}

const s = createBufferStore()
s.put('b1', Buffer.from([1]))
s.put('b2', Buffer.from([2, 2]))
s.put('b3', Buffer.from([3, 3, 3]))
eql(s.asBuffer().toString('hex'), '010202030303')
s.del('b2')
eql(s.asBuffer().toString('hex'), '01030303')
s.put('b1', Buffer.from([1, 1, 1, 1]))
eql(s.asBuffer().toString('hex'), '01010101030303')
s.flush()
eql(s.asBuffer().toString('hex'), '')

module.exports = createBufferStore
