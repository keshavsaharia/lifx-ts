import http from 'http'
import crypto from 'crypto'
import * as stream from 'stream'

import {
	InvalidWebsocketMessage
} from './error'

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

export default class LifxWebsocket {
	request: http.IncomingMessage
	socket: stream.Duplex

	// Queue for joining incoming message buffers with continuation frames
	payload: Array<Buffer>

	constructor(request: http.IncomingMessage, socket: stream.Duplex) {
		this.request = request
		this.socket = socket
		this.payload = []
	}

	handshake() {
		const upgrade = this.getHeader('upgrade')
		if (upgrade !== 'websocket')
			return this.badRequest()

		const key = this.getHeader('sec-websocket-key')
		if (! key || Array.isArray(key))
			return this.badRequest()

		this.socket.write([
			'HTTP/1.1 101 Web Socket Protocol Handshake',
			'Upgrade: WebSocket',
			'Connection: Upgrade',
			'Sec-WebSocket-Accept: ' + this.accept(key),
			'\r\n'
		].join('\r\n'))
	}

	listen() {
		function constructReply(data: any) {
		  // TODO: Construct a WebSocket frame Node.js socket buffer
		  return {}
		}
		function parseMessage(buffer: Buffer) {
		  return null
		}
		this.socket.on('data', (buffer) => {
			const message = parseMessage(buffer)
  			if (message) {
				  this.socket.write(constructReply({ message: 'Hello from the server!' }))
			}
			else if (message === null) {
				console.log('WebSocket connection closed by the client.');
			}
		});

	}

	private parse(buffer: Buffer) {
		// Ensure a header byte is available
		if (buffer.length < 2)
			throw InvalidWebsocketMessage

		const first = buffer.readUInt8(0)
		const final = (first & 0b10000000) > 0
		const op = first & 0b00001111
		// Termination frame or non-text frame
		if (op === 0x8)
			return null
		else if (op !== 0x1)
			return this.disconnect()

		const second = buffer.readUInt8(1)
		const masked = (second & 0b1000000) > 0

		// Keep track of our current position as we advance through the buffer
		let offset = 2
		let length = second & 0b01111111

		// Extended length payload, only take last 6 bytes
		if (length == 127) {
			if (buffer.length < 10)
				throw InvalidWebsocketMessage

			length = buffer.readUIntBE(2, 6)
			// If last two bytes filled, oversized payload (TODO)
			if (buffer.readUInt16BE(8))
				throw InvalidWebsocketMessage

			// Start at end of extended length
			offset = 10
		}
		// Two byte extended length
		else if (length == 126) {
			if (buffer.length < 10)
				throw InvalidWebsocketMessage

			length = buffer.readUInt16BE(2)
			offset = 4
		}
		// Otherwise length is 7 bits or less
		else offset++

		// Get payload with possible unmask operation
		const { payload, overflow } = this.parsePayload(buffer, offset, length, masked)

		if (final) {
			// join all received buffers into a single payload
			const message = Buffer.concat([ ...this.payload, payload ])
			this.payload = []

			// parse message
		}
		else {
			this.payload.push(payload)
		}

		if (overflow.length > 0)
			this.payload.push(overflow)
	}

	private parsePayload(buffer: Buffer, offset: number, length: number, masked?: boolean): { payload: Buffer, overflow: Buffer } {
		const end = offset + length + (masked ? 4 : 0)
		if (buffer.length < end)
			throw InvalidWebsocketMessage

		// If masked, get the next four bytes as an XOR mask and shift the remaining payload
		// buffer over by four bytes
		if (masked) {
			const mask = buffer.slice(offset, offset + 4)

			return {
				payload: Buffer.from(buffer.slice(offset + 4, end).map((b, i) => (b ^ mask[i % 4]))),
			 	overflow: buffer.slice(end)
			}
		}
		else return {
			payload: buffer.slice(offset, end),
			overflow: buffer.slice(end)
		}
	}

	disconnect() {
		return null
	}

	accept(key: string) {
		return crypto.createHash('sha1').update(key + WS_GUID).digest('base64')
	}

	getHeader(name: string) {
		return this.request.headers[name]
	}

	private badRequest() {
		this.socket.end('HTTP/1.1 400 Bad Request')
		return 400
	}
}
