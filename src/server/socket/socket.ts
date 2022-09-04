import crypto from 'crypto'
import * as stream from 'stream'

import {
	LifxServer
} from '../..'

export default class Socket {
	private id: string
	private stopped: boolean

	server: LifxServer
	socket: stream.Duplex

	constructor(server: LifxServer, socket: stream.Duplex) {
		this.id = crypto.randomBytes(8).toString('hex')
		this.server = server
		this.socket = socket
		this.stopped = false
	}

	async stop(error?: any) {
		if (this.stopped)
			return true
		this.stopped = true

		if (this.ended())
			return true

		return new Promise((resolve: (stopped: boolean) => any) => {
			this.socket.end((error && error.toString) ? error.toString() : undefined, () => {
				this.server.removeSocket(this)
				resolve(true)
			})
		})
	}

	destroy() {
		this.stopped = true
		this.socket.destroy()
		this.server.removeSocket(this)
	}

	getId() {
		return this.id
	}

	ended(): boolean {
		return this.socket.readableEnded
	}

}
