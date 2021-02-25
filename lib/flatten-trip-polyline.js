'use strict'

const flattenHafasClientTripPolyline = (polyline) => {
	// We assume that `polyline` is an ordered GeoJSON FeatureCollection.
	return {
		type: 'Feature',
		properties: {},
		geometry: {
			type: 'LineString',
			coordinates: polyline.features.map(f => f.geometry.coordinates),
		},
	}
}

module.exports = flattenHafasClientTripPolyline
