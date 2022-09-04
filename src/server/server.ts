// Simple HTTP server from built-in modules
import http from 'http'

import {
	LifxClient,
	ClientLogEmitter
} from '..'

import {
	Request,
	Socket,
	TCPSocket,
	Websocket
} from '.'

import {
	LIFX_PORT,
	SERVER_CLOSE_TIMEOUT
} from '../constant'

/**
 * @class 	LifxServer
 * @desc 	HTTP server for setting up a browser management interface, managing websockets,
 * 			and providing a REST API for communicating with devices.
 */
export default class LifxServer {
	// Server and connected socket mapping
	server: http.Server
	socket: { [id: string]: Socket }

	// Lifx client reference
	client: LifxClient

	// Server state
	port: number
	alive: boolean

	log: ClientLogEmitter

	constructor(client: LifxClient) {
		this.client = client
		this.alive = false
		this.log = client.log
	}

	async start(port?: number) {
		this.port = port || LIFX_PORT

		this.server = http.createServer((request, response) => {
			const req = new Request(this.client, request, response)
			req.respond().then(() => {
				if (! req.didRespond())
					response.writeHead(200).end('No response')
			})
			.catch((error) => {
				response.writeHead(error.status || 500).end()
			})
		})

		// Listen on the configured port
		this.server.listen(this.port)

		// Maintain socket mapping
		this.socket = {}
		this.server.on('connect', (_, socket) => {
			this.addSocket(new TCPSocket(this, socket))
		})

		// WebSocket upgrade
		this.server.on('upgrade', (request, socket) => {
			const ws = new Websocket(this, request, socket)
			ws.start().then(() => {
				this.addSocket(ws)
			})
		})

		this.alive = true
		this.log.startServer()

		// Listen to shutdown signals and close the socket
		process.on('SIGTERM', () => this.stop())
        process.on('SIGINT', () => this.stop())
	}

	private addSocket(socket: Socket) {
		this.socket[socket.getId()] = socket
	}

	removeSocket(socket: Socket) {
		delete this.socket[socket.getId()]
		console.log(this.socket)
	}

	async stop(force?: boolean) {
		if (! this.alive || ! this.server)
			return true
		this.alive = false

		// Destroy open sockets
		if (this.socket)
			Object.keys(this.socket).forEach((id) => {
				const socket = this.socket[id]
				if (socket)
					socket.stop()
			})

		return new Promise((resolve: (stopped: boolean) => any) => {

			// Force close the server and destroy all sockets
			const closeTimeout = setTimeout(() => {
				this.server.unref()
				Object.keys(this.socket).forEach((id) => {
					const socket = this.socket[id]
					if (socket)
						socket.destroy()
				})
				resolve(false)
			}, SERVER_CLOSE_TIMEOUT)

			// Attempt to close all open connections gracefully
			try {
				this.server.close((error) => {
					clearTimeout(closeTimeout)
					this.server.unref()
					resolve(error == null)
				})
			}
			catch (error) {
				clearTimeout(closeTimeout)
				try {
					this.server.unref()
					resolve(true)
				}
				catch (error) {
					resolve(false)
				}
			}
		})
	}
}
