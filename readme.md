# hafas-gtfs-rt-feed

**Generate a [GTFS Realtime (GTFS-RT)](https://developers.google.com/transit/gtfs-realtime/) feed by polling a [HAFAS endpoint](https://github.com/public-transport/hafas-client#background).**

[![npm version](https://img.shields.io/npm/v/hafas-gtfs-rt-feed.svg)](https://www.npmjs.com/package/hafas-gtfs-rt-feed)
[![build status](https://img.shields.io/github/workflow/status/derhuerst/hafas-gtfs-rt-feed/test/master)](https://github.com/derhuerst/hafas-gtfs-rt-feed/actions)
[![Prosperity/Apache license](https://img.shields.io/static/v1?label=license&message=Prosperity%2FApache&color=0997E8)](#license)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Architecture

`hafas-gtfs-rt-feed` consists of several components, connected to each other via the [NATS Streaming](https://docs.nats.io/nats-streaming-concepts/intro) channels:

1. `monitor-hafas`: Given a [`hafas-client` instance](https://github.com/public-transport/hafas-client), it uses [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips) to poll live data about all vehicles in the configured geographic area.
2. `match-with-gtfs`: Uses [`match-gtfs-rt-to-gtfs`](https://github.com/derhuerst/match-gtfs-rt-to-gtfs) to match this data against [static GTFS](https://developers.google.com/transit/gtfs) data imported into a database.
3. `serve-as-gtfs-rt`: Uses [`gtfs-rt-differential-to-full-dataset`](https://github.com/derhuerst/gtfs-rt-differential-to-full-dataset) to aggregate the matched data into a single [GTFS-RT](https://developers.google.com/transit/gtfs-realtime/) feed, and serves the feed via HTTP.

`monitor-hafas` sends data to `match-with-gtfs` via two NATS Streaming channels `trips` & `movements`; `match-with-gtfs` sends data to `serve-as-gtfs-rt` via two channels `matched-trips` & `matched-movements`.

```
                   GTFS data in a            clients
HAFAS API          PostgreSQL DB                ^
   ^ |                  ^ |                     | GTFS-RT
   | |                  | |                     |
   | v                  | v                     |
monitor-hafas      match-with-gtfs        serve-as-gtfs-rt
   ||                 ^^   ||                   ^  ^
   ||                 ||   ||                   |  |
   |+----> trips -----+|   |+--> matched-trips -+  |
   +-----> movements --+   +---> matched-movements +
```


## Usage

Some preparations are necessary for `hafas-gtfs-rt-feed` to work. Let's get started!

Run `npm init` inside a new directory to initialize an empty [npm](https://docs.npmjs.com/cli/v6/commands/npm)-based project.

```sh
mkdir deutsche-bahn-gtfs-rt-feed
cd deutsche-bahn-gtfs-rt-feed
npm init
```

### set up NATS Streaming

[Install and run the NATS Streaming Server](https://docs.nats.io/nats-streaming-server/run) as documented.

*Note:* If you run Nats Streaming on a different host or port, pass a custom `NATS_STREAMING_URL` environment variable into all `hafas-gtfs-rt-feed` components.

### set up PostgreSQL

Make sure you have a reasonably recent version of [PostgreSQL](https://www.postgresql.org) installed and running. There are guides for many operating systems and environments available on the internet.

*Note:* If you run PostgreSQL on a different host or port, pass custom [`PG*` environment variables](https://www.postgresql.org/docs/13/libpq-envars.html) into the `match.js` component.

### install `hafas-gtfs-rt-feed`

Use the [npm CLI](https://docs.npmjs.com/getting-started/configuring-your-local-environment):

```shell
npm install hafas-gtfs-rt-feed
# added 153 packages in 12s
```

### set up a `hafas-client` instance

`hafas-gtfs-rt-feed` is agnostic to the HAFAS API it pulls data from: To fetch data, `monitor-hafas` just uses the `hafas-client` you passed in, which you must point towards one out of many HAFAS API endpoints.

Set up [`hafas-client` as documented](https://github.com/public-transport/hafas-client/blob/ba27f549520082e576560d235c34f397b0f6e06a/readme.md#usage). A very basic example using the [Deutsche Bahn (DB) endpoint](https://github.com/public-transport/hafas-client/blob/5/p/db/readme.md):

```js
// deutsche-bahn-hafas.js
const createClient = require('hafas-client')
const dbProfile = require('hafas-client/p/db')

// create hafas-client configured to use Deutsche Bahn's HAFAS API
const client = createClient(dbProfile, 'my-awesome-program')

module.exports = client
```

### build the GTFS matching database

`match-with-gtfs` needs a pre-populated matching database to run; It uses [`gtfs-via-postgres`](https://npmjs.com/package/gtfs-via-postgres) and [`match-gtfs-rt-to-gtfs`](https://npmjs.com/package/match-gtfs-rt-to-gtfs) underneath.

First, we're going to use [`gtfs-via-postgres`](https://npmjs.com/package/gtfs-via-postgres)'s `gtfs-to-sql` command-line tool to import our GTFS data into PostgreSQL.

*Note:* Make sure you have an up-to-date [GTFS Static](https://developers.google.com/transit/gtfs) dataset, unzipped into individual `.txt` files.

```sh
# create a PostgreSQL database `gtfs`
psql -c 'create database gtfs'
# configure all subsequent commands to use it
export PGDATABASE=gtfs
# import all .txt files
node_modules/.bin/gtfs-to-sql -d -u path/to/gtfs/files/*.txt
```

You database `gtfs` should contain *basic* GTFS data now.

---

[`match-gtfs-rt-to-gtfs`](https://npmjs.com/package/match-gtfs-rt-to-gtfs) works by matching HAFAS stops & lines against GTFS stops & lines, using their IDs and *their names*. Usually, HAFAS & GTFS stop/line names don't have the same format, so they need to be normalized.

You'll have to implement this normalization logic. A simplified (but very naive) normalization logic *may* look like this:

```js
// hafas-info.js
module.exports = {
	endpointName: 'some-hafas-api',
	normalizeStopName: name => name.toLowerCase().replace(/\s+/g, ' ').trim(),
	normalizeLineName: name => name.toLowerCase().replace(/\s+/g, ' ').trim(),
}
```

```js
// gtfs-info.js
module.exports = {
	endpointName: 'some-gtfs-feed',
	normalizeStopName: name => name.toLowerCase().replace(/\s+St\.$/, ''),
	normalizeLineName: name => name.toLowerCase(),
}
```

`match-gtfs-rt-to-gtfs` needs some special matching indices in the database to work efficiently. Now that we have implemented some normalization logic, we're going to pass it to `match-gtfs-rt-to-gtfs`'s `build-gtfs-match-index` command-line tool:

```sh
# add matching indices to the `gtfs` database
node_modules/.bin/build-gtfs-match-index path/to/hafas-info.js path/to/gtfs-info.js
```

*Note:* `hafas-gtfs-rt-feed` is data- & region-agnostic, so it depends on your HAFAS-endpoint-specific name normalization logic to match as many HAFAS trips/vehicles as possible against the GTFS data. The ratio matched items would ideally be 100%, because GTFS-RT feeds are intended to be consumed *along* a GTFS dataset with *matching IDs*.

### run all components

Now that we've set everything up, let's run all `hafas-gtfs-rt-feed` components to check if they are working!

All three components need to be run in parallel, so just open three terminals to run them. They will start logging [pino-formatted](https://getpino.io/#/?id=usage) log messages.

```shell
# specify the bounding box to be monitored (required)
export BBOX='{"north": 1.1, "west": 22.2, "south": 3.3, "east": 33.3}'
# start monitor-hafas
node_modules/.bin/monitor-hafas deutsche-bahn-hafas.js
# todo: sample logs
```

```shell
node_modules/.bin/match-with-gtfs
# todo: sample logs
```

```shell
node_modules/.bin/serve-as-gtfs-rt
```

### inspecting the feed

Your GTFS-RT feed should now be served at `http://localhost:3000/`, and within a few moments, it should contain data! 👏

You can verify this using many available GTFS-RT tools; Here are two of them to quickly inspect the feed:

- [`print-gtfs-rt-cli`](https://github.com/derhuerst/print-gtfs-rt-cli) is a command-line tool, use it with `curl`: `curl 'http://localhost:3000/' -s | print-gtfs-rt`.
- [`gtfs-rt-inspector`](https://public-transport.github.io/gtfs-rt-inspector/?feedUrl=http%3A%2F%2Flocalhost%3A3000%2F%0A) is a web app that can inspect any [CORS](https://enable-cors.org)-enabled GTFS-RT feed; Paste `http://localhost:3000/` into the url field to inspect yours.

After `monitor.js` has fetched some data from HAFAS, and after `match.js` has matched it against the GTFS (or failed or timed out doing so), you should see [`TripUpdate`s](https://developers.google.com/transit/gtfs-realtime/reference/#message-tripupdate) & [`VehiclePosition`s](https://developers.google.com/transit/gtfs-realtime/reference/#message-vehicleposition).

### metrics

All three components (`monitor-hafas`, `match-with-gtfs`, `serve-as-gtfs-rt`) expose [Prometheus](https://prometheus.io)-compatible metrics via HTTP. You can fetch and process them using e.g. Prometheus, [VictoriaMetrics](https://victoriametrics.com) or the [Grafana Agent](https://grafana.com/docs/grafana-cloud/agent/).

As an example, we're going to inspect `monitor-hafas`'s metrics. Enable them by running it with an `METRICS_SERVER_PORT=9323` environment variable and query its metrics via HTTP:

```shell
curl 'http://localhost:9323/metrics'
```

```
# HELP nats_streaming_sent_total nr. of messages published to NATS streaming
# TYPE nats_streaming_sent_total counter
nats_streaming_sent_total{channel="movements"} 1673
nats_streaming_sent_total{channel="trips"} 1162

# HELP hafas_reqs_total nr. of HAFAS requests
# TYPE hafas_reqs_total counter
hafas_reqs_total{call="radar"} 90
hafas_reqs_total{call="trip"} 1165

# HELP hafas_response_time_seconds HAFAS response time
# TYPE hafas_response_time_seconds summary
hafas_response_time_seconds{quantile="0.05",call="radar"} 1.0396666666666665
hafas_response_time_seconds{quantile="0.5",call="radar"} 3.8535000000000004
hafas_response_time_seconds{quantile="0.95",call="radar"} 6.833
hafas_response_time_seconds_sum{call="radar"} 338.22600000000006
hafas_response_time_seconds_count{call="radar"} 90
hafas_response_time_seconds{quantile="0.05",call="trip"} 2.4385
hafas_response_time_seconds{quantile="0.5",call="trip"} 28.380077380952383
hafas_response_time_seconds{quantile="0.95",call="trip"} 54.51257142857143
hafas_response_time_seconds_sum{call="trip"} 33225.48200000005
hafas_response_time_seconds_count{call="trip"} 1165

# HELP monitored_tiles_total nr. of tiles being monitored
# TYPE monitored_tiles_total gauge
monitored_tiles_total 30

# HELP monitored_trips_total nr. of trips being monitored
# TYPE monitored_trips_total gauge
monitored_trips_total 588
```

### controlling the number of requests to HAFAS

Currently, there is no mechanism to influence the total rate of requests to HAFAS *directly*, no prioritisation between the "find trips in a bounding box" (`hafas-client`'s `radar()`) and "refresh a trip" (`hafas-client`'s `trip()`) requests, and no logic to efficiently use requests up to a certain configured limit.

However, there are some dials to influence the amount requests of both types:

- By defining a smaller or larger bounding box via the `BBOX` environment variable, you can control the total number of monitored trips, and thus the rate of requests.
- By setting `FETCH_TRIPS_INTERVAL`, you can choose how often each monitored trip shall be refreshed. Note that this is a *minimum* interval; If it takes too longer to refresh all trips, the interval will be longer, hence the rate of `trip()` requests will be lower.
- You can throttle the total number of requests to HAFAS by [throttling `hafas-client`](https://github.com/public-transport/hafas-client/blob/5/throttle.js), but depending on the rate you configure, this might cause the refresh of all monitored trips (as well as finding new trips to monitor) to take longer than configured using `FETCH_TRIPS_INTERVAL`, so consider it as a secondary tool.

### exposing feed metadata

If you pass metadata about the GTFS-Static feed used, `serve-as-gtfs-rt` will expose it via HTTP:

```shell
serve-as-gtfs-rt \
	--static-feed-info path/to/gtfs/files/feed_info.txt

curl 'http://localhost:3000/feed_info.csv'
# feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date,feed_version
# openOV,http://openov.nl,en,20210108,20210221,20210108
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
