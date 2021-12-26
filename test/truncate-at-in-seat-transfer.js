'use strict'

const {deepStrictEqual} = require('assert')
const truncateTripAtInSeatTransfer = require('../lib/truncate-at-in-seat-transfer')

const vbbTripWithInSeatTransfer = {
	"id": "1|58020|0|86|11102021",
	"line": {
		"type": "line",
		"id": "134",
		"fahrtNr": "3504",
		"name": "134",
		"public": true,
		"adminCode": "BVB",
		"productName": "Bus",
		"mode": "bus",
		"product": "bus",
		"operator": {
			"type": "operator",
			"id": "berliner-verkehrsbetriebe",
			"name": "Berliner Verkehrsbetriebe"
		},
		"symbol": null,
		"nr": 134,
		"metro": false,
		"express": false,
		"night": false
	},
	"direction": "S+U Rathaus Spandau -> 135 Alt-Kladow",

	"origin": {
		"type": "stop",
		"id": "900000027304",
		"name": "Wasserwerk Spandau",
		"location": {
			"type": "location",
			"id": "900027304",
			"latitude": 52.556665,
			"longitude": 13.16419
		},
		"products": {
			"suburban": false,
			"subway": false,
			"tram": false,
			"bus": true,
			"ferry": false,
			"express": false,
			"regional": false
		}
	},
	"departure": "2021-10-11T12:37:00+02:00",
	"plannedDeparture": "2021-10-11T12:37:00+02:00",
	"departureDelay": null,
	"departurePlatform": null,
	"plannedDeparturePlatform": null,

	"remarks": [
		{
			"type": "hint",
			"code": "bf",
			"text": "barrierefrei"
		},
		{
			"type": "hint",
			"code": "text.journeystop.product.or.direction.changes.journey.message",
			"text": "Verkehrt ab S+U Rathaus Spandau (Berlin) als 135 in Richtung Alt-Kladow"
		}
	],

	"destination": {
		"type": "stop",
		"id": "900000039102",
		"name": "Alt-Kladow",
		"location": {
			"type": "location",
			"id": "900039102",
			"latitude": 52.454179,
			"longitude": 13.144288
		},
		"products": {
			"suburban": false,
			"subway": false,
			"tram": false,
			"bus": true,
			"ferry": true,
			"express": false,
			"regional": false
		}
	},
	"arrival": "2021-10-11T13:18:00+02:00",
	"plannedArrival": "2021-10-11T13:18:00+02:00",
	"arrivalDelay": null,
	"arrivalPlatform": null,
	"plannedArrivalPlatform": null,

	"stopovers": [
		{
			"stop": {
				"type": "stop",
				"id": "900000027304",
				"name": "Wasserwerk Spandau",
				"location": {
					"type": "location",
					"id": "900027304",
					"latitude": 52.556665,
					"longitude": 13.16419
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": null,
			"plannedArrival": null,
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:37:00+02:00",
			"plannedDeparture": "2021-10-11T12:37:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "text.journeystop.product.or.direction.changes.stop.message",
					"text": "Verkehrt ab hier als 134 in Richtung S+U Rathaus Spandau -> 135 Alt-Kladow"
				},
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"id": "118634",
					"type": "warning",
					"summary": "Gemeinsam sicher unterwegs - mit Abstand und medizinischer Maske (in Berlin: FFP2)!",
					"text": "An Haltestellen und Bahnhöfen sowie in Fahrzeugen. Maskenmuffel riskieren mindestens 50 Euro.\n<a href=\"https://www.vbb.de/corona\" target=\"_blank\" rel=\"noopener\">Weitere Informationen</a>",
					"icon": {
						"type": "HIM0",
						"title": null
					},
					"priority": 100,
					"products": {
						"suburban": true,
						"subway": true,
						"tram": true,
						"bus": true,
						"ferry": true,
						"express": true,
						"regional": true
					},
					"company": "VBB",
					"categories": [
						0
					],
					"validFrom": "2021-04-24T00:00:00+02:00",
					"validUntil": "2022-12-31T00:00:00+01:00",
					"modified": "2021-06-12T07:43:36+02:00"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027354",
				"name": "Wolburgsweg",
				"location": {
					"type": "location",
					"id": "900027354",
					"latitude": 52.555613,
					"longitude": 13.169251
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:38:00+02:00",
			"plannedArrival": "2021-10-11T12:38:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:38:00+02:00",
			"plannedDeparture": "2021-10-11T12:38:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027355",
				"name": "Frankenwaldstr.",
				"location": {
					"type": "location",
					"id": "900027355",
					"latitude": 52.5544,
					"longitude": 13.174743
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:39:00+02:00",
			"plannedArrival": "2021-10-11T12:39:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:39:00+02:00",
			"plannedDeparture": "2021-10-11T12:39:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027356",
				"name": "Friedhof In den Kisseln",
				"location": {
					"type": "location",
					"id": "900027356",
					"latitude": 52.553087,
					"longitude": 13.18002
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:41:00+02:00",
			"plannedArrival": "2021-10-11T12:41:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:41:00+02:00",
			"plannedDeparture": "2021-10-11T12:41:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027402",
				"name": "Pionierstr./Zeppelinstr.",
				"location": {
					"type": "location",
					"id": "900027402",
					"latitude": 52.551505,
					"longitude": 13.185575
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:42:00+02:00",
			"plannedArrival": "2021-10-11T12:42:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:42:00+02:00",
			"plannedDeparture": "2021-10-11T12:42:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027455",
				"name": "Falkenhagener Tor",
				"location": {
					"type": "location",
					"id": "900027455",
					"latitude": 52.550202,
					"longitude": 13.190259
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:43:00+02:00",
			"plannedArrival": "2021-10-11T12:43:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:43:00+02:00",
			"plannedDeparture": "2021-10-11T12:43:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029204",
				"name": "Windmühlenberg",
				"location": {
					"type": "location",
					"id": "900029204",
					"latitude": 52.548638,
					"longitude": 13.194349
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:44:00+02:00",
			"plannedArrival": "2021-10-11T12:44:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:44:00+02:00",
			"plannedDeparture": "2021-10-11T12:44:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029251",
				"name": "Kurze Str./Mittelstr.",
				"location": {
					"type": "location",
					"id": "900029251",
					"latitude": 52.54622,
					"longitude": 13.200075
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:46:00+02:00",
			"plannedArrival": "2021-10-11T12:46:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:46:00+02:00",
			"plannedDeparture": "2021-10-11T12:46:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029201",
				"name": "Wröhmännerpark",
				"location": {
					"type": "location",
					"id": "900029201",
					"latitude": 52.542049,
					"longitude": 13.205954
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:48:00+02:00",
			"plannedArrival": "2021-10-11T12:48:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:48:00+02:00",
			"plannedDeparture": "2021-10-11T12:48:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029202",
				"name": "Moritzstr.",
				"location": {
					"type": "location",
					"id": "900029202",
					"latitude": 52.538606,
					"longitude": 13.200722
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:50:00+02:00",
			"plannedArrival": "2021-10-11T12:50:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:50:00+02:00",
			"plannedDeparture": "2021-10-11T12:50:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029302",
				"name": "S+U Rathaus Spandau",
				"location": {
					"type": "location",
					"id": "900029302",
					"latitude": 52.535801,
					"longitude": 13.199895
				},
				"products": {
					"suburban": true,
					"subway": true,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": true,
					"regional": true
				}
			},
			"arrival": "2021-10-11T12:51:00+02:00",
			"plannedArrival": "2021-10-11T12:51:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:51:00+02:00",
			"plannedDeparture": "2021-10-11T12:51:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "text.journeystop.product.or.direction.changes.stop.message",
					"text": "Verkehrt ab hier als 135 in Richtung Alt-Kladow"
				},
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000031101",
				"name": "Brunsbütteler Damm/Ruhlebener Str.",
				"location": {
					"type": "location",
					"id": "900031101",
					"latitude": 52.53296,
					"longitude": 13.198196
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:53:00+02:00",
			"plannedArrival": "2021-10-11T12:53:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:53:00+02:00",
			"plannedDeparture": "2021-10-11T12:53:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000031102",
				"name": "Ziegelhof",
				"location": {
					"type": "location",
					"id": "900031102",
					"latitude": 52.529041,
					"longitude": 13.195347
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:54:00+02:00",
			"plannedArrival": "2021-10-11T12:54:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:54:00+02:00",
			"plannedDeparture": "2021-10-11T12:54:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000032405",
				"name": "Metzer Str.",
				"location": {
					"type": "location",
					"id": "900032405",
					"latitude": 52.525212,
					"longitude": 13.193657
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:56:00+02:00",
			"plannedArrival": "2021-10-11T12:56:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:56:00+02:00",
			"plannedDeparture": "2021-10-11T12:56:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000032104",
				"name": "Melanchthonplatz",
				"location": {
					"type": "location",
					"id": "900032104",
					"latitude": 52.521661,
					"longitude": 13.188928
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:58:00+02:00",
			"plannedArrival": "2021-10-11T12:58:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:58:00+02:00",
			"plannedDeparture": "2021-10-11T12:58:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000032101",
				"name": "Am Omnibushof",
				"location": {
					"type": "location",
					"id": "900032101",
					"latitude": 52.517616,
					"longitude": 13.186241
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:59:00+02:00",
			"plannedArrival": "2021-10-11T12:59:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:59:00+02:00",
			"plannedDeparture": "2021-10-11T12:59:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000032102",
				"name": "Heerstr./Wilhelmstr.",
				"location": {
					"type": "location",
					"id": "900032102",
					"latitude": 52.51669,
					"longitude": 13.179157
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:01:00+02:00",
			"plannedArrival": "2021-10-11T13:01:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:01:00+02:00",
			"plannedDeparture": "2021-10-11T13:01:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000032155",
				"name": "Rodensteinstr.",
				"location": {
					"type": "location",
					"id": "900032155",
					"latitude": 52.513733,
					"longitude": 13.174833
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:03:00+02:00",
			"plannedArrival": "2021-10-11T13:03:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:03:00+02:00",
			"plannedDeparture": "2021-10-11T13:03:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000032103",
				"name": "Weinmeisterhornweg",
				"location": {
					"type": "location",
					"id": "900032103",
					"latitude": 52.511018,
					"longitude": 13.171579
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:04:00+02:00",
			"plannedArrival": "2021-10-11T13:04:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:04:00+02:00",
			"plannedDeparture": "2021-10-11T13:04:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000032156",
				"name": "Karolinenhöhe",
				"location": {
					"type": "location",
					"id": "900032156",
					"latitude": 52.50842,
					"longitude": 13.167579
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:05:00+02:00",
			"plannedArrival": "2021-10-11T13:05:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:05:00+02:00",
			"plannedDeparture": "2021-10-11T13:05:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000038103",
				"name": "Landschaftsfriedhof Gatow",
				"location": {
					"type": "location",
					"id": "900038103",
					"latitude": 52.498334,
					"longitude": 13.152855
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:07:00+02:00",
			"plannedArrival": "2021-10-11T13:07:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:07:00+02:00",
			"plannedDeparture": "2021-10-11T13:07:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000038256",
				"name": "Außenweg",
				"location": {
					"type": "location",
					"id": "900038256",
					"latitude": 52.485183,
					"longitude": 13.135532
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:09:00+02:00",
			"plannedArrival": "2021-10-11T13:09:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:09:00+02:00",
			"plannedDeparture": "2021-10-11T13:09:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000039101",
				"name": "Gutsstr.",
				"location": {
					"type": "location",
					"id": "900039101",
					"latitude": 52.474935,
					"longitude": 13.12097
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:11:00+02:00",
			"plannedArrival": "2021-10-11T13:11:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:11:00+02:00",
			"plannedDeparture": "2021-10-11T13:11:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000039159",
				"name": "Kurpromenade",
				"location": {
					"type": "location",
					"id": "900039159",
					"latitude": 52.470773,
					"longitude": 13.123568
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:12:00+02:00",
			"plannedArrival": "2021-10-11T13:12:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:12:00+02:00",
			"plannedDeparture": "2021-10-11T13:12:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000039158",
				"name": "Seekorso",
				"location": {
					"type": "location",
					"id": "900039158",
					"latitude": 52.467906,
					"longitude": 13.126435
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:13:00+02:00",
			"plannedArrival": "2021-10-11T13:13:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:13:00+02:00",
			"plannedDeparture": "2021-10-11T13:13:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000039108",
				"name": "Waldallee",
				"location": {
					"type": "location",
					"id": "900039108",
					"latitude": 52.465586,
					"longitude": 13.129015
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:14:00+02:00",
			"plannedArrival": "2021-10-11T13:14:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:14:00+02:00",
			"plannedDeparture": "2021-10-11T13:14:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000039157",
				"name": "Gredinger Str.",
				"location": {
					"type": "location",
					"id": "900039157",
					"latitude": 52.46164,
					"longitude": 13.133726
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:15:00+02:00",
			"plannedArrival": "2021-10-11T13:15:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:15:00+02:00",
			"plannedDeparture": "2021-10-11T13:15:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000039156",
				"name": "Schwabinger Weg",
				"location": {
					"type": "location",
					"id": "900039156",
					"latitude": 52.458224,
					"longitude": 13.138139
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:16:00+02:00",
			"plannedArrival": "2021-10-11T13:16:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:16:00+02:00",
			"plannedDeparture": "2021-10-11T13:16:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000039155",
				"name": "Schallweg",
				"location": {
					"type": "location",
					"id": "900039155",
					"latitude": 52.456058,
					"longitude": 13.140791
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:17:00+02:00",
			"plannedArrival": "2021-10-11T13:17:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T13:17:00+02:00",
			"plannedDeparture": "2021-10-11T13:17:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000039102",
				"name": "Alt-Kladow",
				"location": {
					"type": "location",
					"id": "900039102",
					"latitude": 52.454179,
					"longitude": 13.144288
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": true,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T13:18:00+02:00",
			"plannedArrival": "2021-10-11T13:18:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": null,
			"plannedDeparture": null,
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				}
			]
		}
	]
}
const vbbTruncatedTrip = truncateTripAtInSeatTransfer(vbbTripWithInSeatTransfer)
deepStrictEqual(vbbTruncatedTrip, {
	"id": "1|58020|0|86|11102021",
	"line": {
		"type": "line",
		"id": "134",
		"fahrtNr": "3504",
		"name": "134",
		"public": true,
		"adminCode": "BVB",
		"productName": "Bus",
		"mode": "bus",
		"product": "bus",
		"operator": {
			"type": "operator",
			"id": "berliner-verkehrsbetriebe",
			"name": "Berliner Verkehrsbetriebe"
		},
		"symbol": null,
		"nr": 134,
		"metro": false,
		"express": false,
		"night": false
	},
	"direction": "S+U Rathaus Spandau -> 135 Alt-Kladow",

	"origin": {
		"type": "stop",
		"id": "900000027304",
		"name": "Wasserwerk Spandau",
		"location": {
			"type": "location",
			"id": "900027304",
			"latitude": 52.556665,
			"longitude": 13.16419
		},
		"products": {
			"suburban": false,
			"subway": false,
			"tram": false,
			"bus": true,
			"ferry": false,
			"express": false,
			"regional": false
		}
	},
	"departure": "2021-10-11T12:37:00+02:00",
	"plannedDeparture": "2021-10-11T12:37:00+02:00",
	"departureDelay": null,
	"departurePlatform": null,
	"plannedDeparturePlatform": null,

	"remarks": [
		{
			"type": "hint",
			"code": "bf",
			"text": "barrierefrei"
		},
		{
			"type": "hint",
			"code": "text.journeystop.product.or.direction.changes.journey.message",
			"text": "Verkehrt ab S+U Rathaus Spandau (Berlin) als 135 in Richtung Alt-Kladow"
		}
	],

	"destination": {
		"type": "stop",
		"id": "900000029302",
		"name": "S+U Rathaus Spandau",
		"location": {
			"type": "location",
			"id": "900029302",
			"latitude": 52.535801,
			"longitude": 13.199895
		},
		"products": {
			"suburban": true,
			"subway": true,
			"tram": false,
			"bus": true,
			"ferry": false,
			"express": true,
			"regional": true
		}
	},
	"arrival": "2021-10-11T12:51:00+02:00",
	"plannedArrival": "2021-10-11T12:51:00+02:00",
	"arrivalDelay": null,
	"arrivalPlatform": null,
	"plannedArrivalPlatform": null,

	"stopovers": [
		{
			"stop": {
				"type": "stop",
				"id": "900000027304",
				"name": "Wasserwerk Spandau",
				"location": {
					"type": "location",
					"id": "900027304",
					"latitude": 52.556665,
					"longitude": 13.16419
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": null,
			"plannedArrival": null,
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:37:00+02:00",
			"plannedDeparture": "2021-10-11T12:37:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "text.journeystop.product.or.direction.changes.stop.message",
					"text": "Verkehrt ab hier als 134 in Richtung S+U Rathaus Spandau -> 135 Alt-Kladow"
				},
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"id": "118634",
					"type": "warning",
					"summary": "Gemeinsam sicher unterwegs - mit Abstand und medizinischer Maske (in Berlin: FFP2)!",
					"text": "An Haltestellen und Bahnhöfen sowie in Fahrzeugen. Maskenmuffel riskieren mindestens 50 Euro.\n<a href=\"https://www.vbb.de/corona\" target=\"_blank\" rel=\"noopener\">Weitere Informationen</a>",
					"icon": {
						"type": "HIM0",
						"title": null
					},
					"priority": 100,
					"products": {
						"suburban": true,
						"subway": true,
						"tram": true,
						"bus": true,
						"ferry": true,
						"express": true,
						"regional": true
					},
					"company": "VBB",
					"categories": [
						0
					],
					"validFrom": "2021-04-24T00:00:00+02:00",
					"validUntil": "2022-12-31T00:00:00+01:00",
					"modified": "2021-06-12T07:43:36+02:00"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027354",
				"name": "Wolburgsweg",
				"location": {
					"type": "location",
					"id": "900027354",
					"latitude": 52.555613,
					"longitude": 13.169251
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:38:00+02:00",
			"plannedArrival": "2021-10-11T12:38:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:38:00+02:00",
			"plannedDeparture": "2021-10-11T12:38:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027355",
				"name": "Frankenwaldstr.",
				"location": {
					"type": "location",
					"id": "900027355",
					"latitude": 52.5544,
					"longitude": 13.174743
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:39:00+02:00",
			"plannedArrival": "2021-10-11T12:39:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:39:00+02:00",
			"plannedDeparture": "2021-10-11T12:39:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027356",
				"name": "Friedhof In den Kisseln",
				"location": {
					"type": "location",
					"id": "900027356",
					"latitude": 52.553087,
					"longitude": 13.18002
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:41:00+02:00",
			"plannedArrival": "2021-10-11T12:41:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:41:00+02:00",
			"plannedDeparture": "2021-10-11T12:41:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027402",
				"name": "Pionierstr./Zeppelinstr.",
				"location": {
					"type": "location",
					"id": "900027402",
					"latitude": 52.551505,
					"longitude": 13.185575
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:42:00+02:00",
			"plannedArrival": "2021-10-11T12:42:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:42:00+02:00",
			"plannedDeparture": "2021-10-11T12:42:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000027455",
				"name": "Falkenhagener Tor",
				"location": {
					"type": "location",
					"id": "900027455",
					"latitude": 52.550202,
					"longitude": 13.190259
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:43:00+02:00",
			"plannedArrival": "2021-10-11T12:43:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:43:00+02:00",
			"plannedDeparture": "2021-10-11T12:43:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029204",
				"name": "Windmühlenberg",
				"location": {
					"type": "location",
					"id": "900029204",
					"latitude": 52.548638,
					"longitude": 13.194349
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:44:00+02:00",
			"plannedArrival": "2021-10-11T12:44:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:44:00+02:00",
			"plannedDeparture": "2021-10-11T12:44:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029251",
				"name": "Kurze Str./Mittelstr.",
				"location": {
					"type": "location",
					"id": "900029251",
					"latitude": 52.54622,
					"longitude": 13.200075
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:46:00+02:00",
			"plannedArrival": "2021-10-11T12:46:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:46:00+02:00",
			"plannedDeparture": "2021-10-11T12:46:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029201",
				"name": "Wröhmännerpark",
				"location": {
					"type": "location",
					"id": "900029201",
					"latitude": 52.542049,
					"longitude": 13.205954
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:48:00+02:00",
			"plannedArrival": "2021-10-11T12:48:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:48:00+02:00",
			"plannedDeparture": "2021-10-11T12:48:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029202",
				"name": "Moritzstr.",
				"location": {
					"type": "location",
					"id": "900029202",
					"latitude": 52.538606,
					"longitude": 13.200722
				},
				"products": {
					"suburban": false,
					"subway": false,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": false,
					"regional": false
				}
			},
			"arrival": "2021-10-11T12:50:00+02:00",
			"plannedArrival": "2021-10-11T12:50:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:50:00+02:00",
			"plannedDeparture": "2021-10-11T12:50:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		},
		{
			"stop": {
				"type": "stop",
				"id": "900000029302",
				"name": "S+U Rathaus Spandau",
				"location": {
					"type": "location",
					"id": "900029302",
					"latitude": 52.535801,
					"longitude": 13.199895
				},
				"products": {
					"suburban": true,
					"subway": true,
					"tram": false,
					"bus": true,
					"ferry": false,
					"express": true,
					"regional": true
				}
			},
			"arrival": "2021-10-11T12:51:00+02:00",
			"plannedArrival": "2021-10-11T12:51:00+02:00",
			"arrivalDelay": null,
			"arrivalPlatform": null,
			"plannedArrivalPlatform": null,
			"departure": "2021-10-11T12:51:00+02:00",
			"plannedDeparture": "2021-10-11T12:51:00+02:00",
			"departureDelay": null,
			"departurePlatform": null,
			"plannedDeparturePlatform": null,
			"remarks": [
				{
					"type": "hint",
					"code": "text.journeystop.product.or.direction.changes.stop.message",
					"text": "Verkehrt ab hier als 135 in Richtung Alt-Kladow"
				},
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				},
				{
					"type": "hint",
					"code": "OPERATOR",
					"text": "BVG (S+U Rathaus Spandau (Berlin) - Alt-Kladow (Berlin))"
				},
				{
					"type": "hint",
					"code": "px",
					"text": "ab S+U Rathaus Spandau weiter als Bus 135 bis Alt-Kladow (Wasserwerk Spandau (Berlin) - S+U Rathaus Spandau (Berlin))"
				}
			]
		}
	]
}, 'truncated VBB trip is different')

const dbTripWithInSeatTransfer = {
	"id": "1|1030807|4|81|26122021",
	"direction": "Stahnsdorf Waldschänke",
	"line": {
		"type": "line",
		"id": "5-vbbrpm-623",
		"name": "Bus 623",
		"public": true,
		"mode": "bus",
		"product": "bus"
	},

	"origin": {
		"type": "stop",
		"id": "728764",
		"name": "Zehlendorf Eiche, Berlin",
		"location": {
			"type": "location",
			"id": "728764",
			"latitude": 52.434511,
			"longitude": 13.260222
		},
		"products": {},
	},
	"departure": "2021-12-26T13:26:00+01:00",
	"plannedDeparture": "2021-12-26T13:26:00+01:00",
	"departureDelay": null,
	"departurePlatform": null,
	"plannedDeparturePlatform": null,

	"destination": {
		"type": "stop",
		"id": "731479",
		"name": "Krumme Lanke (U), Berlin",
		"location": {
			"type": "location",
			"id": "731479",
			"latitude": 52.443302,
			"longitude": 13.241174
		},
		"products": {},
	},
	"arrival": "2021-12-26T14:17:00+01:00",
	"plannedArrival": "2021-12-26T14:17:00+01:00",
	"arrivalDelay": null,
	"arrivalPlatform": null,
	"plannedArrivalPlatform": null,

	"stopovers": [{
		"stop": {
			"type": "stop",
			"id": "728764",
			"name": "Zehlendorf Eiche, Berlin",
			"location": {
				"type": "location",
				"id": "728764",
				"latitude": 52.434511,
				"longitude": 13.260222
			},
			"products": {},
		},
		"arrival": null,
		"plannedArrival": null,
		"departure": "2021-12-26T13:26:00+01:00",
		"plannedDeparture": "2021-12-26T13:26:00+01:00",
		"plannedDeparturePlatform": null,
		"remarks": [
			{
				"type": "hint",
				"code": "text.journeystop.product.or.direction.changes.stop.message",
				"text": "As Bus 623 heading towards Stahnsdorf Waldschänke from here"
			}
		]
	}, {
		"stop": {
			"type": "stop",
			"id": "731450",
			"name": "Zehlendorf (S), Berlin",
			"location": {
				"type": "location",
				"id": "731450",
				"latitude": 52.431292,
				"longitude": 13.25908
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:27:00+01:00",
		"plannedArrival": "2021-12-26T13:27:00+01:00",
		"departure": "2021-12-26T13:27:00+01:00",
		"plannedDeparture": "2021-12-26T13:27:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731458",
			"name": "Machnower Str./Berlepschstr., Berlin",
			"location": {
				"type": "location",
				"id": "731458",
				"latitude": 52.429872,
				"longitude": 13.257093
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:29:00+01:00",
		"plannedArrival": "2021-12-26T13:29:00+01:00",
		"departure": "2021-12-26T13:29:00+01:00",
		"plannedDeparture": "2021-12-26T13:29:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731459",
			"name": "Schrockstr., Berlin",
			"location": {
				"type": "location",
				"id": "731459",
				"latitude": 52.427463,
				"longitude": 13.254666
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:29:00+01:00",
		"plannedArrival": "2021-12-26T13:29:00+01:00",
		"departure": "2021-12-26T13:29:00+01:00",
		"plannedDeparture": "2021-12-26T13:29:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731438",
			"name": "Behring-Krankenhaus, Berlin",
			"location": {
				"type": "location",
				"id": "731438",
				"latitude": 52.423652,
				"longitude": 13.251421
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:31:00+01:00",
		"plannedArrival": "2021-12-26T13:31:00+01:00",
		"departure": "2021-12-26T13:31:00+01:00",
		"plannedDeparture": "2021-12-26T13:31:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731470",
			"name": "Gutzmannstr., Berlin",
			"location": {
				"type": "location",
				"id": "731470",
				"latitude": 52.421045,
				"longitude": 13.249956
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:32:00+01:00",
		"plannedArrival": "2021-12-26T13:32:00+01:00",
		"departure": "2021-12-26T13:32:00+01:00",
		"plannedDeparture": "2021-12-26T13:32:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731468",
			"name": "Ludwigsfelder Str./Sachtlebenstr., Berlin",
			"location": {
				"type": "location",
				"id": "731468",
				"latitude": 52.418573,
				"longitude": 13.250181
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:33:00+01:00",
		"plannedArrival": "2021-12-26T13:33:00+01:00",
		"departure": "2021-12-26T13:33:00+01:00",
		"plannedDeparture": "2021-12-26T13:33:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735272",
			"name": "Machnower Busch, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735272",
				"latitude": 52.416586,
				"longitude": 13.246522
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:33:00+01:00",
		"plannedArrival": "2021-12-26T13:33:00+01:00",
		"departure": "2021-12-26T13:33:00+01:00",
		"plannedDeparture": "2021-12-26T13:33:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735258",
			"name": "Klausenerstr., Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735258",
				"latitude": 52.413269,
				"longitude": 13.241668
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:34:00+01:00",
		"plannedArrival": "2021-12-26T13:34:00+01:00",
		"departure": "2021-12-26T13:34:00+01:00",
		"plannedDeparture": "2021-12-26T13:34:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735259",
			"name": "Haeckelstr., Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735259",
				"latitude": 52.408846,
				"longitude": 13.238081
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:36:00+01:00",
		"plannedArrival": "2021-12-26T13:36:00+01:00",
		"departure": "2021-12-26T13:36:00+01:00",
		"plannedDeparture": "2021-12-26T13:36:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735268",
			"name": "Meiereifeld, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735268",
				"latitude": 52.405709,
				"longitude": 13.234971
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:37:00+01:00",
		"plannedArrival": "2021-12-26T13:37:00+01:00",
		"departure": "2021-12-26T13:37:00+01:00",
		"plannedDeparture": "2021-12-26T13:37:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "728234",
			"name": "Im Kamp, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "728234",
				"latitude": 52.405008,
				"longitude": 13.230126
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:38:00+01:00",
		"plannedArrival": "2021-12-26T13:38:00+01:00",
		"departure": "2021-12-26T13:38:00+01:00",
		"plannedDeparture": "2021-12-26T13:38:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735271",
			"name": "Rathausmarkt, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735271",
				"latitude": 52.404756,
				"longitude": 13.217163
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:40:00+01:00",
		"plannedArrival": "2021-12-26T13:40:00+01:00",
		"departure": "2021-12-26T13:40:00+01:00",
		"plannedDeparture": "2021-12-26T13:40:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735249",
			"name": "Seeberg, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735249",
				"latitude": 52.403525,
				"longitude": 13.209334
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:42:00+01:00",
		"plannedArrival": "2021-12-26T13:42:00+01:00",
		"departure": "2021-12-26T13:42:00+01:00",
		"plannedDeparture": "2021-12-26T13:42:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735245",
			"name": "Schleusenweg, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735245",
				"latitude": 52.399704,
				"longitude": 13.206988
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:43:00+01:00",
		"plannedArrival": "2021-12-26T13:43:00+01:00",
		"departure": "2021-12-26T13:43:00+01:00",
		"plannedDeparture": "2021-12-26T13:43:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735242",
			"name": "Am Hochwald, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735242",
				"latitude": 52.398014,
				"longitude": 13.207644
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:44:00+01:00",
		"plannedArrival": "2021-12-26T13:44:00+01:00",
		"departure": "2021-12-26T13:44:00+01:00",
		"plannedDeparture": "2021-12-26T13:44:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735293",
			"name": "Waldschänke, Stahnsdorf",
			"location": {
				"type": "location",
				"id": "735293",
				"latitude": 52.393583,
				"longitude": 13.210673
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:46:00+01:00",
		"plannedArrival": "2021-12-26T13:46:00+01:00",
		"departure": "2021-12-26T13:48:00+01:00",
		"plannedDeparture": "2021-12-26T13:48:00+01:00",
		"plannedDeparturePlatform": null,
		"remarks": [
			{
				"type": "hint",
				"code": "text.journeystop.product.or.direction.changes.stop.message",
				"text": "As Bus 622 heading towards U Krumme Lanke from here"
			}
		]
	}, {
		"stop": {
			"type": "stop",
			"id": "370734",
			"name": "Ulmenweg, Stahnsdorf",
			"location": {
				"type": "location",
				"id": "370734",
				"latitude": 52.390248,
				"longitude": 13.205154
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:49:00+01:00",
		"plannedArrival": "2021-12-26T13:49:00+01:00",
		"departure": "2021-12-26T13:49:00+01:00",
		"plannedDeparture": "2021-12-26T13:49:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735292",
			"name": "John-Graudenz-Str., Stahnsdorf",
			"location": {
				"type": "location",
				"id": "735292",
				"latitude": 52.387695,
				"longitude": 13.201252
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:50:00+01:00",
		"plannedArrival": "2021-12-26T13:50:00+01:00",
		"departure": "2021-12-26T13:50:00+01:00",
		"plannedDeparture": "2021-12-26T13:50:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "220380",
			"name": "Heinrich-Zille-Str., Stahnsdorf",
			"location": {
				"type": "location",
				"id": "220380",
				"latitude": 52.385456,
				"longitude": 13.196066
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:51:00+01:00",
		"plannedArrival": "2021-12-26T13:51:00+01:00",
		"departure": "2021-12-26T13:51:00+01:00",
		"plannedDeparture": "2021-12-26T13:51:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "728236",
			"name": "Friedrich-Naumann-Str., Stahnsdorf",
			"location": {
				"type": "location",
				"id": "728236",
				"latitude": 52.383083,
				"longitude": 13.202313
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:53:00+01:00",
		"plannedArrival": "2021-12-26T13:53:00+01:00",
		"departure": "2021-12-26T13:53:00+01:00",
		"plannedDeparture": "2021-12-26T13:53:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735299",
			"name": "Bergstr., Stahnsdorf",
			"location": {
				"type": "location",
				"id": "735299",
				"latitude": 52.38098,
				"longitude": 13.204084
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:53:00+01:00",
		"plannedArrival": "2021-12-26T13:53:00+01:00",
		"departure": "2021-12-26T13:53:00+01:00",
		"plannedDeparture": "2021-12-26T13:53:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735300",
			"name": "Hildegardstr., Stahnsdorf",
			"location": {
				"type": "location",
				"id": "735300",
				"latitude": 52.378867,
				"longitude": 13.208264
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:55:00+01:00",
		"plannedArrival": "2021-12-26T13:55:00+01:00",
		"departure": "2021-12-26T13:55:00+01:00",
		"plannedDeparture": "2021-12-26T13:55:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735290",
			"name": "Annastr., Stahnsdorf",
			"location": {
				"type": "location",
				"id": "735290",
				"latitude": 52.382014,
				"longitude": 13.211204
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:56:00+01:00",
		"plannedArrival": "2021-12-26T13:56:00+01:00",
		"departure": "2021-12-26T13:56:00+01:00",
		"plannedDeparture": "2021-12-26T13:56:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "727493",
			"name": "Am Weiher, Stahnsdorf",
			"location": {
				"type": "location",
				"id": "727493",
				"latitude": 52.384459,
				"longitude": 13.213604
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:56:00+01:00",
		"plannedArrival": "2021-12-26T13:56:00+01:00",
		"departure": "2021-12-26T13:56:00+01:00",
		"plannedDeparture": "2021-12-26T13:56:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735304",
			"name": "Am Upstall, Stahnsdorf",
			"location": {
				"type": "location",
				"id": "735304",
				"latitude": 52.387821,
				"longitude": 13.216435
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:57:00+01:00",
		"plannedArrival": "2021-12-26T13:57:00+01:00",
		"departure": "2021-12-26T13:57:00+01:00",
		"plannedDeparture": "2021-12-26T13:57:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "728235",
			"name": "Friedrich-Weißler-Platz, Stahnsdorf",
			"location": {
				"type": "location",
				"id": "728235",
				"latitude": 52.391614,
				"longitude": 13.220633
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:58:00+01:00",
		"plannedArrival": "2021-12-26T13:58:00+01:00",
		"departure": "2021-12-26T13:58:00+01:00",
		"plannedDeparture": "2021-12-26T13:58:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735294",
			"name": "Stahnsdorfer Hof, Stahnsdorf",
			"location": {
				"type": "location",
				"id": "735294",
				"latitude": 52.392207,
				"longitude": 13.222404
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:59:00+01:00",
		"plannedArrival": "2021-12-26T13:59:00+01:00",
		"departure": "2021-12-26T13:59:00+01:00",
		"plannedDeparture": "2021-12-26T13:59:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "362123",
			"name": "Altes Dorf, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "362123",
				"latitude": 52.394589,
				"longitude": 13.223959
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:00:00+01:00",
		"plannedArrival": "2021-12-26T14:00:00+01:00",
		"departure": "2021-12-26T14:00:00+01:00",
		"plannedDeparture": "2021-12-26T14:00:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735251",
			"name": "Am Weinberg, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735251",
				"latitude": 52.397862,
				"longitude": 13.227555
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:00:00+01:00",
		"plannedArrival": "2021-12-26T14:00:00+01:00",
		"departure": "2021-12-26T14:00:00+01:00",
		"plannedDeparture": "2021-12-26T14:00:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735269",
			"name": "Hakeburg, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735269",
				"latitude": 52.401259,
				"longitude": 13.226018
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:01:00+01:00",
		"plannedArrival": "2021-12-26T14:01:00+01:00",
		"departure": "2021-12-26T14:01:00+01:00",
		"plannedDeparture": "2021-12-26T14:01:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735270",
			"name": "Karl-Marx-Str., Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735270",
				"latitude": 52.404711,
				"longitude": 13.22546
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:02:00+01:00",
		"plannedArrival": "2021-12-26T14:02:00+01:00",
		"departure": "2021-12-26T14:02:00+01:00",
		"plannedDeparture": "2021-12-26T14:02:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735271",
			"name": "Rathausmarkt, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735271",
				"latitude": 52.404756,
				"longitude": 13.217163
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:04:00+01:00",
		"plannedArrival": "2021-12-26T14:04:00+01:00",
		"departure": "2021-12-26T14:04:00+01:00",
		"plannedDeparture": "2021-12-26T14:04:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735254",
			"name": "Heidefeld/Hohe Kiefer, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735254",
				"latitude": 52.405781,
				"longitude": 13.21515
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:05:00+01:00",
		"plannedArrival": "2021-12-26T14:05:00+01:00",
		"departure": "2021-12-26T14:05:00+01:00",
		"plannedDeparture": "2021-12-26T14:05:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735255",
			"name": "Am Fuchsbau, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735255",
				"latitude": 52.410276,
				"longitude": 13.219384
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:06:00+01:00",
		"plannedArrival": "2021-12-26T14:06:00+01:00",
		"departure": "2021-12-26T14:06:00+01:00",
		"plannedDeparture": "2021-12-26T14:06:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735256",
			"name": "OdF-Platz, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735256",
				"latitude": 52.413368,
				"longitude": 13.222278
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:07:00+01:00",
		"plannedArrival": "2021-12-26T14:07:00+01:00",
		"departure": "2021-12-26T14:07:00+01:00",
		"plannedDeparture": "2021-12-26T14:07:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735265",
			"name": "Uhlenhorst, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735265",
				"latitude": 52.417215,
				"longitude": 13.225865
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:08:00+01:00",
		"plannedArrival": "2021-12-26T14:08:00+01:00",
		"departure": "2021-12-26T14:08:00+01:00",
		"plannedDeparture": "2021-12-26T14:08:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735253",
			"name": "An der Stammbahn, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735253",
				"latitude": 52.420308,
				"longitude": 13.225263
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:09:00+01:00",
		"plannedArrival": "2021-12-26T14:09:00+01:00",
		"departure": "2021-12-26T14:09:00+01:00",
		"plannedDeparture": "2021-12-26T14:09:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731572",
			"name": "Lloyd-G.-Wells-Str., Berlin",
			"location": {
				"type": "location",
				"id": "731572",
				"latitude": 52.42367,
				"longitude": 13.225784
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:10:00+01:00",
		"plannedArrival": "2021-12-26T14:10:00+01:00",
		"departure": "2021-12-26T14:10:00+01:00",
		"plannedDeparture": "2021-12-26T14:10:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731566",
			"name": "Clauertstr., Berlin",
			"location": {
				"type": "location",
				"id": "731566",
				"latitude": 52.427499,
				"longitude": 13.229631
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:12:00+01:00",
		"plannedArrival": "2021-12-26T14:12:00+01:00",
		"departure": "2021-12-26T14:12:00+01:00",
		"plannedDeparture": "2021-12-26T14:12:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731496",
			"name": "Potsdamer Chaussee/Lindenthaler Allee, Berlin",
			"location": {
				"type": "location",
				"id": "731496",
				"latitude": 52.430969,
				"longitude": 13.229928
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:13:00+01:00",
		"plannedArrival": "2021-12-26T14:13:00+01:00",
		"departure": "2021-12-26T14:13:00+01:00",
		"plannedDeparture": "2021-12-26T14:13:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731501",
			"name": "Niklasstr., Berlin",
			"location": {
				"type": "location",
				"id": "731501",
				"latitude": 52.434214,
				"longitude": 13.229838
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:14:00+01:00",
		"plannedArrival": "2021-12-26T14:14:00+01:00",
		"departure": "2021-12-26T14:14:00+01:00",
		"plannedDeparture": "2021-12-26T14:14:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731495",
			"name": "Mexikoplatz (S), Berlin",
			"location": {
				"type": "location",
				"id": "731495",
				"latitude": 52.437315,
				"longitude": 13.231924
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:15:00+01:00",
		"plannedArrival": "2021-12-26T14:15:00+01:00",
		"departure": "2021-12-26T14:15:00+01:00",
		"plannedDeparture": "2021-12-26T14:15:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731500",
			"name": "Forststr., Berlin",
			"location": {
				"type": "location",
				"id": "731500",
				"latitude": 52.440192,
				"longitude": 13.236346
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:16:00+01:00",
		"plannedArrival": "2021-12-26T14:16:00+01:00",
		"departure": "2021-12-26T14:16:00+01:00",
		"plannedDeparture": "2021-12-26T14:16:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731479",
			"name": "Krumme Lanke (U), Berlin",
			"location": {
				"type": "location",
				"id": "731479",
				"latitude": 52.443302,
				"longitude": 13.241174
			},
			"products": {},
		},
		"arrival": "2021-12-26T14:17:00+01:00",
		"plannedArrival": "2021-12-26T14:17:00+01:00",
		"departure": null,
		"plannedDeparture": null,
		"plannedDeparturePlatform": null
	}],
}
const dbTruncatedTrip = truncateTripAtInSeatTransfer(dbTripWithInSeatTransfer)
deepStrictEqual(dbTruncatedTrip, {
	"id": "1|1030807|4|81|26122021",
	"direction": "Stahnsdorf Waldschänke",
	"line": {
		"type": "line",
		"id": "5-vbbrpm-623",
		"name": "Bus 623",
		"public": true,
		"mode": "bus",
		"product": "bus"
	},

	"origin": {
		"type": "stop",
		"id": "728764",
		"name": "Zehlendorf Eiche, Berlin",
		"location": {
			"type": "location",
			"id": "728764",
			"latitude": 52.434511,
			"longitude": 13.260222
		},
		"products": {},
	},
	"departure": "2021-12-26T13:26:00+01:00",
	"plannedDeparture": "2021-12-26T13:26:00+01:00",
	"departureDelay": null,
	"departurePlatform": null,
	"plannedDeparturePlatform": null,

	"destination": {
		"type": "stop",
		"id": "735293",
		"name": "Waldschänke, Stahnsdorf",
		"location": {
			"type": "location",
			"id": "735293",
			"latitude": 52.393583,
			"longitude": 13.210673
		},
		"products": {},
	},
	"arrival": "2021-12-26T13:46:00+01:00",
	"plannedArrival": "2021-12-26T13:46:00+01:00",
	"arrivalDelay": null,
	"arrivalPlatform": null,
	"plannedArrivalPlatform": null,

	"stopovers": [{
		"stop": {
			"type": "stop",
			"id": "728764",
			"name": "Zehlendorf Eiche, Berlin",
			"location": {
				"type": "location",
				"id": "728764",
				"latitude": 52.434511,
				"longitude": 13.260222
			},
			"products": {},
		},
		"arrival": null,
		"plannedArrival": null,
		"departure": "2021-12-26T13:26:00+01:00",
		"plannedDeparture": "2021-12-26T13:26:00+01:00",
		"plannedDeparturePlatform": null,
		"remarks": [
			{
				"type": "hint",
				"code": "text.journeystop.product.or.direction.changes.stop.message",
				"text": "As Bus 623 heading towards Stahnsdorf Waldschänke from here"
			}
		]
	}, {
		"stop": {
			"type": "stop",
			"id": "731450",
			"name": "Zehlendorf (S), Berlin",
			"location": {
				"type": "location",
				"id": "731450",
				"latitude": 52.431292,
				"longitude": 13.25908
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:27:00+01:00",
		"plannedArrival": "2021-12-26T13:27:00+01:00",
		"departure": "2021-12-26T13:27:00+01:00",
		"plannedDeparture": "2021-12-26T13:27:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731458",
			"name": "Machnower Str./Berlepschstr., Berlin",
			"location": {
				"type": "location",
				"id": "731458",
				"latitude": 52.429872,
				"longitude": 13.257093
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:29:00+01:00",
		"plannedArrival": "2021-12-26T13:29:00+01:00",
		"departure": "2021-12-26T13:29:00+01:00",
		"plannedDeparture": "2021-12-26T13:29:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731459",
			"name": "Schrockstr., Berlin",
			"location": {
				"type": "location",
				"id": "731459",
				"latitude": 52.427463,
				"longitude": 13.254666
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:29:00+01:00",
		"plannedArrival": "2021-12-26T13:29:00+01:00",
		"departure": "2021-12-26T13:29:00+01:00",
		"plannedDeparture": "2021-12-26T13:29:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731438",
			"name": "Behring-Krankenhaus, Berlin",
			"location": {
				"type": "location",
				"id": "731438",
				"latitude": 52.423652,
				"longitude": 13.251421
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:31:00+01:00",
		"plannedArrival": "2021-12-26T13:31:00+01:00",
		"departure": "2021-12-26T13:31:00+01:00",
		"plannedDeparture": "2021-12-26T13:31:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731470",
			"name": "Gutzmannstr., Berlin",
			"location": {
				"type": "location",
				"id": "731470",
				"latitude": 52.421045,
				"longitude": 13.249956
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:32:00+01:00",
		"plannedArrival": "2021-12-26T13:32:00+01:00",
		"departure": "2021-12-26T13:32:00+01:00",
		"plannedDeparture": "2021-12-26T13:32:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "731468",
			"name": "Ludwigsfelder Str./Sachtlebenstr., Berlin",
			"location": {
				"type": "location",
				"id": "731468",
				"latitude": 52.418573,
				"longitude": 13.250181
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:33:00+01:00",
		"plannedArrival": "2021-12-26T13:33:00+01:00",
		"departure": "2021-12-26T13:33:00+01:00",
		"plannedDeparture": "2021-12-26T13:33:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735272",
			"name": "Machnower Busch, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735272",
				"latitude": 52.416586,
				"longitude": 13.246522
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:33:00+01:00",
		"plannedArrival": "2021-12-26T13:33:00+01:00",
		"departure": "2021-12-26T13:33:00+01:00",
		"plannedDeparture": "2021-12-26T13:33:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735258",
			"name": "Klausenerstr., Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735258",
				"latitude": 52.413269,
				"longitude": 13.241668
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:34:00+01:00",
		"plannedArrival": "2021-12-26T13:34:00+01:00",
		"departure": "2021-12-26T13:34:00+01:00",
		"plannedDeparture": "2021-12-26T13:34:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735259",
			"name": "Haeckelstr., Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735259",
				"latitude": 52.408846,
				"longitude": 13.238081
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:36:00+01:00",
		"plannedArrival": "2021-12-26T13:36:00+01:00",
		"departure": "2021-12-26T13:36:00+01:00",
		"plannedDeparture": "2021-12-26T13:36:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735268",
			"name": "Meiereifeld, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735268",
				"latitude": 52.405709,
				"longitude": 13.234971
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:37:00+01:00",
		"plannedArrival": "2021-12-26T13:37:00+01:00",
		"departure": "2021-12-26T13:37:00+01:00",
		"plannedDeparture": "2021-12-26T13:37:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "728234",
			"name": "Im Kamp, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "728234",
				"latitude": 52.405008,
				"longitude": 13.230126
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:38:00+01:00",
		"plannedArrival": "2021-12-26T13:38:00+01:00",
		"departure": "2021-12-26T13:38:00+01:00",
		"plannedDeparture": "2021-12-26T13:38:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735271",
			"name": "Rathausmarkt, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735271",
				"latitude": 52.404756,
				"longitude": 13.217163
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:40:00+01:00",
		"plannedArrival": "2021-12-26T13:40:00+01:00",
		"departure": "2021-12-26T13:40:00+01:00",
		"plannedDeparture": "2021-12-26T13:40:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735249",
			"name": "Seeberg, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735249",
				"latitude": 52.403525,
				"longitude": 13.209334
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:42:00+01:00",
		"plannedArrival": "2021-12-26T13:42:00+01:00",
		"departure": "2021-12-26T13:42:00+01:00",
		"plannedDeparture": "2021-12-26T13:42:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735245",
			"name": "Schleusenweg, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735245",
				"latitude": 52.399704,
				"longitude": 13.206988
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:43:00+01:00",
		"plannedArrival": "2021-12-26T13:43:00+01:00",
		"departure": "2021-12-26T13:43:00+01:00",
		"plannedDeparture": "2021-12-26T13:43:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735242",
			"name": "Am Hochwald, Kleinmachnow",
			"location": {
				"type": "location",
				"id": "735242",
				"latitude": 52.398014,
				"longitude": 13.207644
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:44:00+01:00",
		"plannedArrival": "2021-12-26T13:44:00+01:00",
		"departure": "2021-12-26T13:44:00+01:00",
		"plannedDeparture": "2021-12-26T13:44:00+01:00",
		"plannedDeparturePlatform": null
	}, {
		"stop": {
			"type": "stop",
			"id": "735293",
			"name": "Waldschänke, Stahnsdorf",
			"location": {
				"type": "location",
				"id": "735293",
				"latitude": 52.393583,
				"longitude": 13.210673
			},
			"products": {},
		},
		"arrival": "2021-12-26T13:46:00+01:00",
		"plannedArrival": "2021-12-26T13:46:00+01:00",
		"departure": "2021-12-26T13:48:00+01:00",
		"plannedDeparture": "2021-12-26T13:48:00+01:00",
		"plannedDeparturePlatform": null,
		"remarks": [
			{
				"type": "hint",
				"code": "text.journeystop.product.or.direction.changes.stop.message",
				"text": "As Bus 622 heading towards U Krumme Lanke from here"
			}
		]
	}],
}, 'truncated DB trip is different')

console.info('truncateTripAtInSeatTransfer seems to work ✔︎')
