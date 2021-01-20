#!/bin/bash

set -e
set -o pipefail
set -x

cd "$(dirname $0)"

wget -q -r --no-parent --no-directories -P gtfs -N 'https://vbb-gtfs.jannisr.de/latest/'

env | grep '^PG' || true

NODE_ENV=production ../gtfs-to-sql \
	gtfs/agency.csv \
	gtfs/calendar.csv \
	gtfs/calendar_dates.csv \
	gtfs/frequencies.csv \
	gtfs/routes.csv \
	gtfs/shapes.csv \
	gtfs/stop_times.csv \
	gtfs/stops.csv \
	gtfs/transfers.csv \
	gtfs/trips.csv \
	-d | psql -b

NODE_ENV=production ../build-gtfs-match-index \
	hafas-info.js gtfs-info.js \
	| psql -b

export MATCH_TRIP_TIMEOUT=300000 # 5m
export MATCH_MOVEMENT_TIMEOUT=300000 # 5m

# kill child processes on exit
# https://stackoverflow.com/questions/360201/how-do-i-kill-background-processes-jobs-when-my-shell-script-exits/2173421#2173421
trap 'exit_code=$?; kill -- $(jobs -p); exit $exit_code' SIGINT SIGTERM EXIT

cat unmatched.ndjson.gz | gunzip | ../match.js hafas-info.js gtfs-info.js >matched.ndjson
../serve.js <matched.ndjson &
sleep 5 # wait for serve.js to ingest the data

curl 'http://localhost:3000/' -s \
| ../node_modules/.bin/print-gtfs-rt --json \
| ./expect-matched.js
