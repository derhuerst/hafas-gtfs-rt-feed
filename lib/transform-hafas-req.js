'use strict'

const {isIP} = require('net')
const {Agent} = require('https')
const roundRobin = require('@derhuerst/round-robin-scheduler')

let transformHafasRequest = (_, req) => req
if (process.env.LOCAL_ADDRESS) {
	const agents = process.env.LOCAL_ADDRESS
	.split(',')
	.map((localAddress) => {
		const family = isIP(localAddress)
		if (family === 0) throw new Error('invalid local address:' + localAddress)
		return new Agent({localAddress, family})
	})
	const agentPool = roundRobin(agents)
	transformHafasRequest = (_, req) => ({
		...req,
		agent: agentPool.get(),
	})
}

module.exports = transformHafasRequest
