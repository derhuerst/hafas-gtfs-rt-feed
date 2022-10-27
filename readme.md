# hafas-gtfs-rt-feed

**Generate a [GTFS Realtime (GTFS-RT)](https://gtfs.org/realtime/) feed by polling a [HAFAS endpoint](https://github.com/public-transport/hafas-client#background)** and matching the data against a [GTFS Static/Schedule](https://gtfs.org/schedule/) dataset.

[![npm version](https://img.shields.io/npm/v/hafas-gtfs-rt-feed.svg)](https://www.npmjs.com/package/hafas-gtfs-rt-feed)
[![build status](https://img.shields.io/github/workflow/status/derhuerst/hafas-gtfs-rt-feed/test/master)](https://github.com/derhuerst/hafas-gtfs-rt-feed/actions)
[![Prosperity/Apache license](https://img.shields.io/static/v1?label=license&message=Prosperity%2FApache&color=0997E8)](#license)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Architecture

`hafas-gtfs-rt-feed` consists of 3 components, connected to each other via [NATS Streaming](https://docs.nats.io/nats-streaming-concepts/intro) channels:

1. `monitor-hafas`: Given a [`hafas-client` instance](https://github.com/public-transport/hafas-client), it uses [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips) to poll live data about all vehicles in the configured geographic area.
2. `match-with-gtfs`: Uses [`match-gtfs-rt-to-gtfs`](https://github.com/derhuerst/match-gtfs-rt-to-gtfs) to match this data against [static GTFS](https://gtfs.org/schedule/) data imported into a database.
3. `serve-as-gtfs-rt`: Uses [`gtfs-rt-differential-to-full-dataset`](https://github.com/derhuerst/gtfs-rt-differential-to-full-dataset) to aggregate the matched data into a single [GTFS-RT](https://gtfs.org/realtime/) feed, and serves the feed via HTTP.

`monitor-hafas` sends data to `match-with-gtfs` via two NATS Streaming channels `trips` & `movements`; `match-with-gtfs` sends data to `serve-as-gtfs-rt` via two channels `matched-trips` & `matched-movements`.

```mermaid
flowchart TB
  subgraph external[ ]
    hafas(HAFAS API):::external
    db(GTFS Static/Schedule in PostgreSQL):::external
    consumers(consumers):::external
    classDef external fill:#ffd9c2,stroke:#ff8e62
  end
  style external fill:none,stroke:none
  subgraph hafas-gtfs-rt-feed
      monitor-hafas(monitor-hafas)
      match-with-gtfs(match-with-gtfs)
      serve-as-gtfs-rt(serve-as-gtfs-rt)
  end
  style hafas-gtfs-rt-feed fill:none,stroke:#9370db
    subgraph nats[NATS Streaming]
        trips[trips channel]:::channel
        movements[movements channel]:::channel
        matched-trips[matched-trips channel]:::channel
        matched-movements[matched-movements channel]:::channel
    classDef channel fill:#ffffde,stroke:#aaaa33
    end
  style nats fill:none

    hafas-- realtime data -->monitor-hafas
    db-- static data -->match-with-gtfs
    serve-as-gtfs-rt-- GTFS-RT -->consumers

    monitor-hafas.->trips.->match-with-gtfs
    monitor-hafas.->movements.->match-with-gtfs
    match-with-gtfs.->matched-trips.->serve-as-gtfs-rt
    match-with-gtfs.->matched-movements.->serve-as-gtfs-rt
```


## Getting Started

Some preparations are necessary for `hafas-gtfs-rt-feed` to work. Let's get started!

Run `npm init` inside a new directory to initialize an empty [npm](https://docs.npmjs.com/cli/v8/commands/npm)-based project.

```sh
mkdir my-hafas-based-gtfs-rt-feed
cd my-hafas-based-gtfs-rt-feed
npm init
```

### set up NATS Streaming

[Install and run the NATS Streaming Server](https://docs.nats.io/nats-streaming-server/run) as documented.

*Note:* If you run Nats Streaming on a different host or port (e.g. via Docker Compose), pass a custom `NATS_STREAMING_URL` environment variable into all `hafas-gtfs-rt-feed` components.

### set up PostgreSQL

Make sure you have **[PostgreSQL](https://www.postgresql.org) >=14** installed and running ([`match-gtfs-rt-to-gtfs`](https://github.com/derhuerst/match-gtfs-rt-to-gtfs), a dependency of this project, needs it). There are guides for many operating systems and environments available on the internet.

*Note:* If you run PostgreSQL on a different host or port, export the appropriate [`PG*` environment variables](https://www.postgresql.org/docs/14/libpq-envars.html). The commands explain mentioned below will use them.

### install `hafas-gtfs-rt-feed`

Use the [npm CLI](https://docs.npmjs.com/getting-started/configuring-your-local-environment):

```shell
npm install hafas-gtfs-rt-feed
# added 153 packages in 12s
```

### configure a `hafas-client` instance

`hafas-gtfs-rt-feed` is agnostic to the HAFAS API it pulls data from: To fetch data, `monitor-hafas` just uses the `hafas-client` you instantiate in a file, which queries one out of many available HAFAS API endpoints.

Set up [`hafas-client` as documented](https://github.com/public-transport/hafas-client/blob/5.27.0/readme.md#usage). A very basic example using the [Deutsche Bahn (DB) endpoint](https://github.com/public-transport/hafas-client/blob/5/p/db/readme.md) looks as follows:

```js
// db-hafas-client.js
const createHafasClient = require('hafas-client')
const dbProfile = require('hafas-client/p/db')

// please pick something meaningful, e.g. the URL of your GitHub repo
const userAgent = 'my-awesome-program'

// create hafas-client configured to use Deutsche Bahn's HAFAS API
const hafasClient = createHafasClient(dbProfile, userAgent)

module.exports = hafasClient
```

### build the GTFS matching database

`match-with-gtfs` – `hafas-gtfs-rt-feed`'s 2nd processing step – needs a pre-populated matching database in order to match data fetched from HAFAS against the [GTFS Static/Schedule](https://gtfs.org/schedule/) data; It uses [`gtfs-via-postgres`](https://npmjs.com/package/gtfs-via-postgres) and [`match-gtfs-rt-to-gtfs`](https://npmjs.com/package/match-gtfs-rt-to-gtfs) underneath to do this matching.

First, we're going to use [`gtfs-via-postgres`](https://npmjs.com/package/gtfs-via-postgres)'s `gtfs-to-sql` command-line tool to import our GTFS data into PostgreSQL.

*Note:* Make sure you have an up-to-date [static GTFS](https://gtfs.org/schedule/) dataset, unzipped into individual `.txt` files.

```sh
# create a PostgreSQL database `gtfs`
psql -c 'create database gtfs'
# configure all subsequent commands to use it
export PGDATABASE=gtfs
# import all .txt files
node_modules/.bin/gtfs-to-sql -d -u path/to/gtfs/files/*.txt
```

You database `gtfs` should contain the static GTFS data in a basic form now.

---

[`match-gtfs-rt-to-gtfs`](https://npmjs.com/package/match-gtfs-rt-to-gtfs) works by matching HAFAS stops & lines against GTFS stops & lines, using their IDs and *their names*. Usually, HAFAS & GTFS stop/line names don't have the same format (e.g. `Berlin Hbf` & `S+U Berlin Hauptbahnhof`), so they need to be normalized.

You'll have to implement this normalization logic. A simplified (but *very naive*) normalization logic would look like this:

```js
// hafas-config.js
module.exports = {
	endpointName: 'some-hafas-api',
	normalizeStopName: name => name.toLowerCase().replace(/\s+/g, ' ').trim(),
	normalizeLineName: name => name.toLowerCase().replace(/\s+/g, ' ').trim(),
}
```

```js
// gtfs-config.js
module.exports = {
	endpointName: 'some-gtfs-feed',
	normalizeStopName: name => name.toLowerCase().replace(/\s+St\.$/, ''),
	normalizeLineName: name => name.toLowerCase(),
}
```

`match-gtfs-rt-to-gtfs` needs some special matching indices in the database to work. Now that we have implemented the names normalization logic, we're going to pass it to `match-gtfs-rt-to-gtfs`'s `build-gtfs-match-index` command-line tool:

```sh
# add matching indices to the `gtfs` database
node_modules/.bin/build-gtfs-match-index path/to/hafas-config.js path/to/gtfs-config.js
```

*Note:* `hafas-gtfs-rt-feed` is data- & region-agnostic, so it depends on your HAFAS-endpoint-specific name normalization logic to match as many HAFAS trips/vehicles as possible against the GTFS data. Ideally, the stop/line names are normalized so well that HAFAS data can *always* be matched to the (static) GTFS data. This is how GTFS-RT feeds are intended to be consumed: *along* a (static) GTFS dataset with 100% *matching IDs*. If the name normalization logic *doesn't* handle all cases, the GTFS-RT feed will contain `TripUpdate`s & `VehiclePosition`s whose `route_id` or `trip_id` doesn't occur in the GTFS dataset.

### run it

Now that we've set everything up, let's run all `hafas-gtfs-rt-feed` components to check if they are working!

All three components need to be run in parallel, so just open three terminals to run them. Remember to set the `NATS_STREAMING_URL` & `PG*` environment variables (see above) in all three of them, if necessary.

They log [pino-formatted](https://getpino.io/#/?id=usage) log messages to `stdout`, so for local development, we use [`pino-pretty`](https://www.npmjs.com/package/pino-pretty) to make them more readable.

```shell
# specify the bounding box to be monitored (required)
export BBOX='{"north": 1.1, "west": 22.2, "south": 3.3, "east": 33.3}'
# start monitor-hafas
node_modules/.bin/monitor-hafas db-hafas-client.js | npx pino-pretty
# todo: sample logs
```

```shell
node_modules/.bin/match-with-gtfs | npx pino-pretty
# todo: sample logs
```

```shell
node_modules/.bin/serve-as-gtfs-rt | npx pino-pretty
```

### inspect the feed

Your GTFS-RT feed should now be served at `http://localhost:3000/`, and within a few moments, it should contain data! 👏

You can verify this using many available GTFS-RT tools; Here are two of them to quickly inspect the feed:

- [`print-gtfs-rt-cli`](https://github.com/derhuerst/print-gtfs-rt-cli) is a command-line tool, use it with `curl`: `curl 'http://localhost:3000/' -sf | print-gtfs-rt`.
- [`gtfs-rt-inspector`](https://public-transport.github.io/gtfs-rt-inspector/?feedUrl=http%3A%2F%2Flocalhost%3A3000%2F%0A) is a web app that can inspect any [CORS](https://enable-cors.org)-enabled GTFS-RT feed; Paste `http://localhost:3000/` into the url field to inspect yours.

After `monitor.js` has fetched some data from HAFAS, and after `match.js` has matched it against the GTFS (or failed or timed out doing so), you should see [`TripUpdate`s](https://gtfs.org/realtime/reference/#message-tripupdate) & [`VehiclePosition`s](https://gtfs.org/realtime/reference/#message-vehicleposition).


## Usage

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
hafas_reqs_total{call="radar"} 12
hafas_reqs_total{call="trip"} 1165

# HELP hafas_response_time_seconds HAFAS response time
# TYPE hafas_response_time_seconds summary
hafas_response_time_seconds{quantile="0.05",call="radar"} 1.0396666666666665
hafas_response_time_seconds{quantile="0.5",call="radar"} 3.8535000000000004
hafas_response_time_seconds{quantile="0.95",call="radar"} 6.833
hafas_response_time_seconds_sum{call="radar"} 338.22600000000006
hafas_response_time_seconds_count{call="radar"} 90
hafas_response_time_seconds{quantile="0.05",call="trip"} 2.4385
# …

# HELP tiles_fetched_total nr. of tiles fetched from HAFAS
# TYPE tiles_fetched_total counter
tiles_fetched_total 2

# HELP movements_fetched_total nr. of movements fetched from HAFAS
# TYPE movements_fetched_total counter
movements_fetched_total 362

# HELP fetch_all_movements_total how often all movements have been fetched
# TYPE fetch_all_movements_total counter
fetch_all_movements_total 1

# HELP fetch_all_movements_duration_seconds time that fetching all movements currently takes
# TYPE fetch_all_movements_duration_seconds gauge
fetch_all_movements_duration_seconds 2.4
```

### health check

`serve-as-gtfs-rt` exposes a [health check](https://microservices.io/patterns/observability/health-check-api.html) that checks if there are any recent entities in the feed.

```shell
# healthy
curl 'http://localhost:3000/health' -I
# HTTP/1.1 200 OK
# …

# not healthy
curl 'http://localhost:3000/health' -I
# HTTP/1.1 503 Service Unavailable
# …
```

### on-demand mode

Optionally, you can run your GTFS-RT feed in a demand-responsive mode, where it will only fetch data from HAFAS as long someone requests the GTFS-RT feed, which effectively reduces the long-term nr. of requests to HAFAS.

To understand how this works, remember that

- movements fetched from HAFAS are formatted as GTFS-RT `VehiclePosition`s.
- trips fetched from HAFAS are formatted as GTFS-RT `TripUpdate`s.
- the whole `monitor-hafas`, `match-with-gtfs` & `serve-as-gtfs-rt` setup works like a streaming pipeline.

The on-demand mode works like this:

- `monitor-hafas` is either just fetching movements (if you configured it to fetch *only trips* on demand) or completely idle (if you configured it to fetch *both movements & trips* on demand) by default.
- `monitor-hafas` also subscribes to a `demand` NATS Streaming channel, which serves as a communication channel for `serve-as-gtfs-rt` to signal demand.
- When the GTFS-RT feed is requested via HTTP,
	1. `serve-as-gtfs-rt` serves the current feed (which contains either `VehiclePositions`s only, or no entities whatsoever, depending on the on-demand configuration).
	2. `serve-as-gtfs-rt` signals demand via the `demand` channel.
	3. Upon receiving a demand signal, `monitor-hafas` will start fetching trips – or both movements & trips, depending on the on-demand configuration.

This means that, after a first request(s) for the GTFS-RT feed signalling demand, it will take a bit of time until all data is served with subsequent GTFS-RT feed requests; As long as there is constant for the feed, the on-demand mode will behave as if it isn't turned on.

Tell `serve-as-gtfs-rt` to signal demand via the `--signal-demand` option. You can then configure `monitor-hafas`'s exact behaviour using the following options:

```
--movements-fetch-mode <mode>
    Control when movements are fetched from HAFAS.
    "on-demand":
        Only fetch movements from HAFAS when the `serve-as-gtfs-rt` component
        has signalled demand. Trips won't be fetched continuously anymore.
    "continuously" (default):
        Always fetch movements.
--movements-demand-duration <milliseconds>
    With `--movements-fetch-mode "on-demand"`, when the `serve-as-gtfs-rt` component
    has signalled demand, for how long shall movements be fetched?
    Default: movements fetching interval (60s by default) * 5
--trips-fetch-mode <mode>
    Control when trips are fetched from HAFAS.
    "never":
        Never fetch a movement's respective trip.
    "on-demand":
        Only fetch movements' respective trips from HAFAS when the `serve-as-gtfs-rt`
        component has signalled demand.
    "continuously" (default):
        Always fetch each movement's respective trip.
--trips-demand-duration <milliseconds>
    With `--trips-fetch-mode "on-demand"`, when the `serve-as-gtfs-rt` component
    has signalled demand, for how long shall trips be fetched?
    Default: movements fetching interval (60s by default) * 2
```

### controlling the number of requests to HAFAS

Currently, there is no mechanism to influence the total rate of requests to HAFAS *directly*, no prioritisation between the "find trips in a bounding box" (`hafas-client`'s `radar()`) and "refresh a trip" (`hafas-client`'s `trip()`) requests, and no logic to efficiently use requests up to a certain configured limit.

However, there are some dials to influence the amount requests of both types:

- By defining a smaller or larger bounding box via the `BBOX` environment variable, you can control the total number of monitored trips, and thus the rate of requests.
- By setting `FETCH_TILES_INTERVAL`, you can choose how often the bounding box (or the vehicles within, rather) shall be refreshed, and subsequently how often each trip will be fetched if you have configured that. Note that if a refresh takes longer to than the configured interval, another refresh will follow right after, but the total rate of `radar()` requests to HAFAS will be lower.
- You can throttle the total number of requests to HAFAS by [throttling `hafas-client`](https://github.com/public-transport/hafas-client/blob/5/throttle.js), but depending on the rate you configure, this might cause the refresh of all monitored trips (as well as finding new trips to monitor) to take longer than configured using `FETCH_TRIPS_INTERVAL`, so consider it as a secondary tool.

### exposing feed metadata

If you pass metadata about the GTFS-Static feed used, `serve-as-gtfs-rt` will expose it via HTTP:

```shell
serve-as-gtfs-rt \
	--static-feed-info path/to/gtfs/files/feed_info.txt \
	--static-feed-url https://data.ndovloket.nl/flixbus/flixbus-eu.zip

curl 'http://localhost:3000/feed_info.csv'
# feed_publisher_name,feed_publisher_url,feed_lang,feed_start_date,feed_end_date,feed_version
# openOV,http://openov.nl,en,20210108,20210221,20210108

curl 'http://localhost:3000/feed_info.csv' -I
# HTTP/1.1 302 Found
# location: https://data.ndovloket.nl/flixbus/flixbus-eu.zip
```


## Related projects

- [`hafas-gtfs-rt-server-example`](https://github.com/derhuerst/hafas-gtfs-rt-server-example) – Using [`hafas-client`](https://github.com/public-transport/hafas-client), [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips) & [`hafas-gtfs-rt-feed`](https://github.com/derhuerst/hafas-gtfs-rt-feed) as a GTFS-RT server.
- [`print-gtfs-rt-cli`](https://github.com/derhuerst/print-gtfs-rt-cli) – Read a [GTFS Realtime (GTFS-RT)](https://gtfs.org/realtime/) feed from `stdin`, print human-readable or as JSON.
- [`gtfs-rt-inspector`](https://github.com/public-transport/gtfs-rt-inspector) – Web app to inspect & analyze any [CORS](https://enable-cors.org)-enabled [GTFS Realtime (GTFS-RT)](https://gtfs.org/realtime/) feed.
- [`match-gtfs-rt-to-gtfs`](https://github.com/derhuerst/match-gtfs-rt-to-gtfs) – Match realtime transit data (e.g. from [GTFS Realtime](https://gtfs.org/reference/realtime/v2/)) with [GTFS Static](https://gtfs.org/reference/static) data, even if they don't share an ID.
- [`gtfs-rt-differential-to-full-dataset`](https://github.com/derhuerst/gtfs-rt-differential-to-full-dataset) – Transform a continuous [GTFS Realtime](https://gtfs.org/realtime/) stream of [`DIFFERENTIAL` incrementality](https://gtfs.org/realtime/reference/#enum-incrementality) data into a [`FULL_DATASET`](https://gtfs.org/realtime/reference/#enum-incrementality) dump.
- [`transloc-to-gtfs-real-time`](https://github.com/jonathonwpowell/transloc-to-gtfs-real-time) – Transform Transloc Real Time API to the GTFS RealTime Format

There are [several projects making use of `hafas-gtfs-rt-server`](https://github.com/derhuerst/hafas-gtfs-rt-feed/network/dependents?package_id=UGFja2FnZS00MzY3NzU1NjU%3D).


## License

This project is dual-licensed: **My contributions are licensed under the [*Prosperity Public License*](https://prosperitylicense.com), [contributions of other people](https://github.com/derhuerst/hafas-gtfs-rt-feed/graphs/contributors) are licensed as [Apache 2.0](https://apache.org/licenses/LICENSE-2.0)**.

> This license allows you to use and share this software for noncommercial purposes for free and to try this software for commercial purposes for thirty days.

> Personal use for research, experiment, and testing for the benefit of public knowledge, personal study, private entertainment, hobby projects, amateur pursuits, or religious observance, without any anticipated commercial application, doesn’t count as use for a commercial purpose.

[Get in touch with me](https://jannisr.de/) to buy a commercial license or read more about [why I sell private licenses for my projects](https://gist.github.com/derhuerst/0ef31ee82b6300d2cafd03d10dd522f7).


## Contributing

By contributing, you agree to release your modifications under the [Apache 2.0 license](LICENSE-APACHE).
