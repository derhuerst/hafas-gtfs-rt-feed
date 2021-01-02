# hafas-gtfs-rt-feed

**Generate a [GTFS Realtime](https://developers.google.com/transit/gtfs-realtime/) feed by polling a [HAFAS endpoint](https://github.com/public-transport/hafas-client#background).**

[![npm version](https://img.shields.io/npm/v/hafas-gtfs-rt-feed.svg)](https://www.npmjs.com/package/hafas-gtfs-rt-feed)
[![build status](https://img.shields.io/travis/derhuerst/hafas-gtfs-rt-feed.svg)](https://travis-ci.org/derhuerst/hafas-gtfs-rt-feed)
[![Prosperity/Apache license](https://img.shields.io/static/v1?label=license&message=Prosperity%2FApache&color=0997E8)](#license)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)

`hafas-gtfs-rt-feed`

1. gets a [`hafas-client`](https://github.com/public-transport/hafas-client) instance passed in, and uses [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips) to poll live data about all vehicles in the specified bounding box.
2. uses [`match-gtfs-rt-to-gtfs`](https://github.com/derhuerst/match-gtfs-rt-to-gtfs) to match the HAFAS-ish data against static GTFS data imported in a database using [`gtfs-via-postgres`](https://github.com/derhuerst/gtfs-via-postgres).
3. uses [`gtfs-rt-differential-to-full-dataset`](https://github.com/derhuerst/gtfs-rt-differential-to-full-dataset) to aggregate the data into a single [GTFS Realtime (GTFS-RT)](https://developers.google.com/transit/gtfs-realtime/) feed, and [`serve-buffer`](https://github.com/derhuerst/serve-buffer) to serve the feed from memory.


## Installing

```shell
npm install hafas-gtfs-rt-feed
```


## Usage

```shell
todo
```


## Related

- [`hafas-gtfs-rt-server-example`](https://github.com/derhuerst/hafas-gtfs-rt-server-example) – Using [`hafas-client`](https://github.com/public-transport/hafas-client), [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips) & [`hafas-gtfs-rt-feed`](https://github.com/derhuerst/hafas-gtfs-rt-feed) as a GTFS-RT server.
- [`match-gtfs-rt-to-gtfs`](https://github.com/derhuerst/match-gtfs-rt-to-gtfs) – Match realtime transit data (e.g. from [GTFS Realtime](https://gtfs.org/reference/realtime/v2/)) with [GTFS Static](https://gtfs.org/reference/static) data, even if they don't share an ID.
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
