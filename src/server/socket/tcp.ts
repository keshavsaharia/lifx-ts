import * as stream from 'stream'

import {
	LifxServer
} from '../..'

import Socket from './socket'

export default class TCPSocket extends Socket {

	constructor(server: LifxServer, socket: stream.Duplex) {
		super(server, socket)

		// Execute stop when the socket closes
		this.socket.on('close', () => {
			this.stop()
		})
	}

}
