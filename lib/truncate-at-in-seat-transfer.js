'use strict'

const REMARK_CODE = 'text.journeystop.product.or.direction.changes.stop.message'
const isProductOrDirectionChangesRemark = r => r.code === REMARK_CODE

// For a trip with an in-seat transfer (a.k.a. through service) to another trip,
// most HAFAS endpoint seem to just include all stopovers of latter.
// But they add a special remark indicating that the trip (and often line) has
// changed; We use this remark to trunace the concatenated stopovers of the 2nd
// trip.
const truncateTripAtInSeatTransfer = (trip) => {
	const changeIdx = 1 + trip.stopovers.slice(1).findIndex((st) => (
		Array.isArray(st.remarks)
		&& st.remarks.some(isProductOrDirectionChangesRemark)
	))
	if (changeIdx < 1) return trip // not found, abort

	const changeSt = trip.stopovers[changeIdx]
	return {
		...trip,

		destination: changeSt.stop,

		arrival: changeSt.arrival || null,
		plannedArrival: changeSt.plannedArrival || null,
		arrivalDelay: changeSt.arrivalDelay !== undefined
			? changeSt.arrivalDelay
			: null,
		arrivalPlatform: changeSt.arrivalPlatform || null,
		plannedArrivalPlatform: changeSt.plannedArrivalPlatform || null,

		stopovers: trip.stopovers.slice(0, changeIdx + 1),
	}
}

module.exports = truncateTripAtInSeatTransfer
