'use strict'

const ttlBuffer = require('ttl-buffer')

const setWithTtlAndCountMetric = (ttl, countGaugeMetric, labels = {}) => {
	const initialValue = new Map()
	setImmediate(() => {
		countGaugeMetric.set(labels, initialValue.size)
	})

	return ttlBuffer({
		ttl,
		initialValue,
		in: (map, key) => {
			if (map.has(key)) {
				map.set(key, map.get(key) + 1)
			} else {
				map.set(key, 1)
				countGaugeMetric.set(labels, map.size)
			}
			return map
		},
		out: (map, key) => {
			const refCount = map.get(key) - 1
			if (refCount <= 0) {
				map.delete(key)
				countGaugeMetric.set(labels, map.size)
			} else {
				map.set(key, refCount)
			}
			return map
		},
	})
}

module.exports = setWithTtlAndCountMetric
