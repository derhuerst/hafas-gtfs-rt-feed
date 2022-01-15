#!/bin/bash

set -e
set -o pipefail

cd "$(dirname $0)"

set -x

node truncate-at-in-seat-transfer.js

wget --compression auto \
	-r --no-parent --no-directories -R .csv.gz \
	-P gtfs -N 'https://vbb-gtfs.jannisr.de/2020-12-28/'

env | grep '^PG' || true

NODE_ENV=production ../gtfs-to-sql --trips-without-shape-id -d -- \
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
	| psql -b

NODE_ENV=production ../build-gtfs-match-index \
	hafas-info.js gtfs-info.js \
	| psql -b

export MATCH_TRIP_TIMEOUT=300000 # 5m
export MATCH_MOVEMENT_TIMEOUT=300000 # 5m

# kill child processes on exit
# https://stackoverflow.com/questions/360201/how-do-i-kill-background-processes-jobs-when-my-shell-script-exits/2173421#2173421
trap 'exit_code=$?; kill -- $(jobs -p); exit $exit_code' SIGINT SIGTERM EXIT

../match.js hafas-info.js gtfs-info.js &
../serve.js &

sleep 3 # wait for match.js to connect (i know this is ugly)
cat unmatched-movements.ndjson.gz | gunzip | publish-to-nats-streaming-channel movements -s
cat unmatched-trips.ndjson.gz | gunzip | publish-to-nats-streaming-channel trips -s

# wait until all messages have been processed
match_client_id=$(./nats-client-id match)
serve_client_id=$(./nats-client-id serve)
function nats_inspect {
	node -p "$1" "$(nats-streaming-stats --json | jq -r -c .)"
}
function nats_channel_msgs {
	nats_inspect "((JSON.parse(process.argv[1]).channels || []).find(c => c.name === '$1') || {}).messages"
}
function nats_sub_msgs {
	nats_inspect "((JSON.parse(process.argv[1]).subscriptions || []).find(s => s.clientId === '$1' && s.channel === '$2') || {}).latestMsgSeq"
}
nr_of_movements_msgs=$(nats_channel_msgs movements)
nr_of_trips_msgs=$(nats_channel_msgs trips)
echo "waiting for $nr_of_movements_msgs movements msgs & $nr_of_trips_msgs trips msgs to be matched"
until
	[ $(nats_sub_msgs $match_client_id movements) -ge $nr_of_movements_msgs ] && \
	[ $(nats_sub_msgs $match_client_id trips) -ge $nr_of_trips_msgs ] && \
	[ $(nats_sub_msgs $serve_client_id matched-movements) -ge $nr_of_movements_msgs ] && \
	[ $(nats_sub_msgs $serve_client_id matched-trips) -ge $nr_of_trips_msgs ]
do
	sleep 10
done

sleep 5
nats-streaming-stats

./expect-fully-read-sub "$match_client_id" movements
./expect-fully-read-sub "$match_client_id" trips
./expect-fully-read-sub "$serve_client_id" matched-movements
./expect-fully-read-sub "$serve_client_id" matched-trips

curl 'http://localhost:3000/' -s \
| ../node_modules/.bin/print-gtfs-rt --json \
| ./expect-matched.js
