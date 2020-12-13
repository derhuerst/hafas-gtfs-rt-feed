# hafas-gtfs-rt-feed

**Generate a [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/) feed by [monitoring](https://github.com/derhuerst/hafas-monitor-trips) a [HAFAS endpoint](https://github.com/public-transport/hafas-client#background).**

[![npm version](https://img.shields.io/npm/v/hafas-gtfs-rt-feed.svg)](https://www.npmjs.com/package/hafas-gtfs-rt-feed)
[![build status](https://img.shields.io/travis/derhuerst/hafas-gtfs-rt-feed.svg)](https://travis-ci.org/derhuerst/hafas-gtfs-rt-feed)
[![Prosperity/Apache license](https://img.shields.io/static/v1?label=license&message=Prosperity%2FApache&color=0997E8)](#license)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installing

```shell
npm install hafas-gtfs-rt-feed
```


## Usage

```js
const createHafas = require('bvg-hafas')
const createMonitor = require('hafas-monitor-trips')
const createGtfsRtFeed = require('hafas-gtfs-rt-feed')

const hafas = createHafas('hafas-gtfs-rt-feed example')
const monitor = createMonitor(hafas, {
	north: 52.52,
	west: 13.36,
	south: 52.5,
	east: 13.39
})

const feed = createGtfsRtFeed(monitor)
feed.pipe(process.stdout)
```

`feed` is a [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) in [object mode](https://nodejs.org/api/stream.html#stream_object_mode) that emits ([pbf](https://developers.google.com/protocol-buffers/)-encoded) [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/reference/) `FeedEntity` chunks. Each `FeedEntity` contains either a [`TripUpdate`](https://developers.google.com/transit/gtfs-realtime/reference/#message-tripupdate) or a [`VehiclePosition`](https://developers.google.com/transit/gtfs-realtime/reference/#message-vehicleposition).

If you pass `encodePbf: false`, the items won't be encoded as [Protocol Buffers](https://developers.google.com/protocol-buffers/), but kept as raw JavaScript objects:

```js
const feed = createGtfsRtFeed(monitor, {encodePbf: false})
feed.on('data', (msg) => {
	console.log(msg)
})
```

```js
{
	id: '1',
	vehicle: {
		trip: {trip_id: '1|65978|0|86|14062019', route_id: '250'},
		vehicle: {id: null, label: 'U Franz-Neumann-Platz'},
		position: {latitude: 52.57779, longitude: 13.398431},
		stop_id: '900000131528',
		current_status: 2 // IN_TRANSIT_TO
	}
}
{
	id: '2',
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
}
```

### as a dump

`createGtfsRtFeed` just returns a raw feed of data, as extracted from the HAFAS endpoint using [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips). It is similar (but not the same) to the [`incrementality: DIFFERENTIAL`](https://developers.google.com/transit/gtfs-realtime/reference#enum-incrementality) mode ([which is just a draft spec right now](https://github.com/google/transit/issues/84)): Each item in the feed describes the current state of *one* trip/vehicle.

To get a full dump, with the [`incrementality: FULL_DATASET`](https://developers.google.com/transit/gtfs-realtime/reference#enum-incrementality) semantics (containing *all* trips/vehicles), use the `as-dump` converter:

```js
const gtfsRtAsDump = require('hafas-gtfs-rt-feed/as-dump')

const feed = createGtfsRtFeed(monitor, {encodePbf: false})
feed.on('error', console.error)
const dump = gtfsRtAsDump()
dump.on('error', console.error)

feed.pipe(dump)
setInterval(() => {
	// Use asFeedMessage() in your app to distribute the dump e.g. via HTTP.
	console.log(dump.asFeedMessage())
}, 5000)
```

*pro tip:* To distribute this GTFS-RT dataset via HTTP, use [`serve-buffer`](https://github.com/derhuerst/serve-buffer).


## Related

- [`hafas-gtfs-rt-server-example`](https://github.com/derhuerst/hafas-gtfs-rt-server-example) – Using [`hafas-client`](https://github.com/public-transport/hafas-client), [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips) & [`hafas-gtfs-rt-feed`](https://github.com/derhuerst/hafas-gtfs-rt-feed) as a GTFS-RT server.
- [`match-gtfs-rt-to-gtfs`](https://github.com/derhuerst/match-gtfs-rt-to-gtfs) – match realtime transit data (e.g. from [GTFS Realtime](https://gtfs.org/reference/realtime/v2/)) with [GTFS Static](https://gtfs.org/reference/static) data, even if they don't share an ID.
- [`gtfs-rt-differential-to-full-dataset`](https://github.com/derhuerst/gtfs-rt-differential-to-full-dataset) – Transform a continuous [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/) stream of [`DIFFERENTIAL` incrementality](https://developers.google.com/transit/gtfs-realtime/reference/#enum-incrementality) data into a [`FULL_DATASET`](https://developers.google.com/transit/gtfs-realtime/reference/#enum-incrementality) dump.
- [`transloc-to-gtfs-real-time`](https://github.com/jonathonwpowell/transloc-to-gtfs-real-time) – Transform Transloc Real Time API to the GTFS RealTime Format


## License

This project is dual-licensed: **My contributions are licensed under the [*Prosperity Public License*](https://prosperitylicense.com), [contributions of other people](https://github.com/derhuerst/hafas-gtfs-rt-feed/graphs/contributors) are licensed as [Apache 2.0](https://apache.org/licenses/LICENSE-2.0)**.

> This license allows you to use and share this software for noncommercial purposes for free and to try this software for commercial purposes for thirty days.

> Personal use for research, experiment, and testing for the benefit of public knowledge, personal study, private entertainment, hobby projects, amateur pursuits, or religious observance, without any anticipated commercial application, doesn’t count as use for a commercial purpose.

[Buy a commercial license](https://licensezero.com/offers/20e3ea67-5f73-4aa8-943d-079aefdc109b) or read more about [why I sell private licenses for my projects](https://gist.github.com/derhuerst/0ef31ee82b6300d2cafd03d10dd522f7).


## Contributing

If you have a question or have difficulties using `hafas-gtfs-rt-feed`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/hafas-gtfs-rt-feed/issues).

By contributing, you agree to release your modifications under the [Apache 2.0 license](LICENSE-APACHE).
