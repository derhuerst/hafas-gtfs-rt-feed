# hafas-gtfs-rt-feed

**Generate a [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/) feed by [monitoring](https://github.com/derhuerst/hafas-monitor-trips) a [HAFAS endpoint](https://github.com/public-transport/hafas-client#background).**

[![npm version](https://img.shields.io/npm/v/hafas-gtfs-rt-feed.svg)](https://www.npmjs.com/package/hafas-gtfs-rt-feed)
[![build status](https://img.shields.io/travis/derhuerst/hafas-gtfs-rt-feed.svg)](https://travis-ci.org/derhuerst/hafas-gtfs-rt-feed)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/hafas-gtfs-rt-feed.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install hafas-gtfs-rt-feed
```


## Usage

```js
const createHafas = require('bvg-hafas')
const createMonitor = require('hafas-monitor-trips')
const createGtfsRtFeed = require('hafas-gtfs-rt-feed')
const encodeChunks = require('length-prefixed-stream/encode')

const hafas = createHafas('hafas-gtfs-rt-feed example')
const monitor = createMonitor(hafas, {
	north: 52.52,
	west: 13.36,
	south: 52.5,
	east: 13.39
})

const feed = createGtfsRtFeed(monitor)
feed.pipe(encodeChunks()).pipe(process.stdout)
```

`feed` is a [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) in [object mode](https://nodejs.org/api/stream.html#stream_object_mode) that emits [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/reference/) `FeedMessage` entities, containing [`TripUpdate`](https://developers.google.com/transit/gtfs-realtime/reference/#message-tripupdate) and [`VehiclePosition`](https://developers.google.com/transit/gtfs-realtime/reference/#message-vehicleposition) items.

If you pass `debug: true`, the items won't be encoded as [Protocol Buffers](https://developers.google.com/protocol-buffers/), but kept as raw JavaScript objects:

```js
const feed = createGtfsRtFeed(monitor, {debug: true})
feed.on('data', (msg) => {
	console.log(msg)
})
```

```js
{
	header: {gtfs_realtime_version: '2.0', timestamp: 1560505296},
	entity: [{
		id: '1',
		vehicle: {
			trip: {trip_id: '1|65978|0|86|14062019', route_id: '250'},
			vehicle: {id: null, label: 'U Franz-Neumann-Platz'},
			position: {latitude: 52.57779, longitude: 13.398431},
			stop_id: '900000131528',
			current_status: 2 // IN_TRANSIT_TO
		}
	}]
}
{
	header: {gtfs_realtime_version: '2.0', timestamp: 1560505423},
	entity: [{
		id: '1',
		trip_update: {
			trip: {trip_id: '1|33718|9|86|14062019', route_id: 's1'},
			vehicle: {id: '11451', label: 'S Wannsee'},
			stop_time_update: [{
				stop_id: '900000053301',
				arrival: {time: null, delay: null},
				departure: {time: 1560502440, delay: 0},
				schedule_relationship: 0 // SCHEDULED
			}, {
				stop_id: '900000052201',
				arrival: {time: 1560502560, delay: 0},
				departure: {time: 1560502560, delay: 0},
				schedule_relationship: 0 // SCHEDULED
			},
			// …
			{
				stop_id: '900000200005',
				arrival: {time: 1560507360, delay: 60},
				departure: {time: null, delay: null},
				schedule_relationship: 0 // SCHEDULED
			}]
		}
	}]
}
```


## Contributing

If you have a question or have difficulties using `hafas-gtfs-rt-feed`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/hafas-gtfs-rt-feed/issues).
