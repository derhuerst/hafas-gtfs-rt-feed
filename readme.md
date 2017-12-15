# vbb-gtfs-rt-feed

**Generate a [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/) feed by checking departures.** Work in progress.

[![npm version](https://img.shields.io/npm/v/vbb-gtfs-rt-feed.svg)](https://www.npmjs.com/package/vbb-gtfs-rt-feed)
[![build status](https://img.shields.io/travis/derhuerst/vbb-gtfs-rt-feed.svg)](https://travis-ci.org/derhuerst/vbb-gtfs-rt-feed)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-gtfs-rt-feed.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)


## Installing

```shell
npm install vbb-gtfs-rt-feed
```


## Usage

```js
const monitor = require('vbb-monitor')
const convertToGtfsRt = require('vbb-gtfs-rt-feed')

const stations = ['900000100003'] // array of station ids
const interval = 10 * 1000 // every 10 seconds

monitor(stations, interval)
.pipe(convertToGtfsRt())
.on('data', console.log)
```

This will log updates in the [GTFS Realtime `TripUpdate` format](https://developers.google.com/transit/gtfs-realtime/reference/#message_tripupdate):

```
Uint8Array [
	10, 12, 10, 5, 49, 52, 48, 49, 57, 42, 3, 50, 52, 56,
	18, 11, 26, 9, 8, 140, 6, 16, 144, 150, 207, 209, 5
]
```


## Contributing

If you have a question or have difficulties using `vbb-gtfs-rt-feed`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/vbb-gtfs-rt-feed/issues).
