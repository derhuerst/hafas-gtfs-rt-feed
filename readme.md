# vbb-gtfs-rt-feed

**Generate a [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/) of VBB public transport.** Work in progress.

[![npm version](https://img.shields.io/npm/v/vbb-gtfs-rt-feed.svg)](https://www.npmjs.com/package/vbb-gtfs-rt-feed)
[![build status](https://img.shields.io/travis/derhuerst/vbb-gtfs-rt-feed.svg)](https://travis-ci.org/derhuerst/vbb-gtfs-rt-feed)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-gtfs-rt-feed.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install vbb-gtfs-rt-feed
```


## Usage

```js
const createHafas = require('bvg-hafas')
const createMonitor = require('hafas-monitor-trips')
const createGtfsRtFeed = require('vbb-gtfs-rt-feed')

const hafas = createHafas('vbb-gtfs-rt-feed example')
const monitor = createMonitor(hafas, {
	north: 52.52,
	west: 13.36,
	south: 52.5,
	east: 13.39
})

const feed = createGtfsRtFeed(monitor)
feed.pipe(process.stdout)
```

This will log updates in the [GTFS Realtime `TripUpdate` format](https://developers.google.com/transit/gtfs-realtime/reference/#message_tripupdate):

```
todo
```


## Contributing

If you have a question or have difficulties using `vbb-gtfs-rt-feed`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/vbb-gtfs-rt-feed/issues).
