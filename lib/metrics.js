'use strict'

const {
	register,
	collectDefaultMetrics,
} = require('prom-client')
const {createServer} = require('http')

const DEFAULT_PORT = process.env.METRICS_SERVER_PORT
	? parseInt(process.env.METRICS_SERVER_PORT)
	: 0 // find an available port

// The http-metrics-middleware package does too much, so we implement the
// HTTP metrics server by ourselves here.
const createMetricsServer = (opt = {}) => {
	opt = {
		defaultLabels: {},
		serverPort: DEFAULT_PORT,
		...opt,
	}

	register.setDefaultLabels(opt.defaultLabels)
	collectDefaultMetrics({register})

	const handleRequest = (req, res) => {
		if (new URL(req.url, 'http://localhost').pathname !== '/metrics') {
			res.writeHead(404)
			res.end()
			return;
		}
		if (req.method !== 'GET' && req.method !== 'POST') {
			res.writeHead(405)
			res.end()
			return;
		}

		register.metrics()
		.then((metrics) => {
			res.setHeader('Content-Type', register.contentType)
			res.end(metrics)
		})
		.catch((err) => {
			res.statusCode = 500
			res.setHeader('Content-Type', 'text/plain')
			res.end(err + '\n' + err.stack)
		})
	}

	const server = createServer(handleRequest)
	server.start = () => {
		return new Promise((resolve, reject) => {
			server.listen(opt.serverPort, (err) => {
				if (err) reject(err)
				else resolve()
			})
		})
	}

	return server
}

module.exports = {
	register,
	createMetricsServer,
}
