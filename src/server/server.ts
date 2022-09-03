// Simple HTTP server from built-in modules
import http from 'http'
import { Socket } from 'net'
import fs from 'fs'
import path from 'path'
import url from 'url'
import querystring from 'querystring'

import {
	LifxClient,
	ServerLogEmitter
} from '..'

import Request from './request'
import Websocket from './websocket'

import {
	LIFX_PORT
} from '../constant'

/**
 * @class 	LifxServer
 * @desc 	Simple HTTP server for setting up a browser management interface
 * 			and REST API for communicating with devices.
 */
export default class LifxServer {
	server: http.Server
	socket: { [id: string]: Socket }
	websocket: { [id: string]: Websocket }
	socketId: number = 0

	client: LifxClient
	port: number
	alive: boolean
	log: ServerLogEmitter

	constructor(client: LifxClient) {
		this.client = client
		this.alive = false
		this.log = new ServerLogEmitter(this, client)
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
				if (! req.didRespond())
					response.writeHead(500).end()
			})
		})

		// Listen on the configured port
		this.server.listen(this.port)

		// Maintain socket mapping
		this.socket = {}
		this.server.on('connection', (socket) => {
			// Generate new string ID for this socket
			const id = this.getSocketId()
			this.socket[id] = socket

			// Remove the socket when it closes
			socket.on('close', () => {
				delete this.socket[id]
			})
		})

		// WebSocket upgrade
		this.server.on('upgrade', (request, socket) => {

			const ws = new Websocket(request, socket)
			ws.handshake()
			ws.listen()
		})

		this.alive = true
		this.log.startServer()

		// Listen to shutdown signals and close the socket
		process.on('SIGTERM', () => this.stop())
        process.on('SIGINT', () => this.stop())
	}

	async stop() {
		if (! this.alive || ! this.server)
			return true
		this.alive = false
		this.log.stopServer()

		// Destroy open sockets
		if (this.socket)
			Object.keys(this.socket).forEach((id) => {
				const socket = this.socket[id]
				if (socket)
					socket.destroy()
			})

		return new Promise((resolve: (stopped: boolean) => any) => {
			try {
				this.server.close((error) => {
					this.server.unref()
					resolve(error == null)
				})
			}
			catch (error) {
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

	getSocketId() {
		return this.socketId++ + ''
	}
}
