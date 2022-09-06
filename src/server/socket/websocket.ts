import http from 'http'
import crypto from 'crypto'
import * as stream from 'stream'

import {
	LifxServer
} from '../..'

import Socket from './socket'

import {
	WebsocketMessage
} from '../interface'

import {
	WebsocketHandshake,
	InvalidWebsocketMessage
} from '../error'

import {
	WS_GUID
} from '../../constant'

export default class Websocket extends Socket {
	request: http.IncomingMessage
	upgraded: boolean
	listener?: (chunk: any) => void

	// Queue for joining incoming message buffers with continuation frames
	payload: Array<Buffer>

	constructor(server: LifxServer, request: http.IncomingMessage, socket: stream.Duplex) {
		super(server, socket)
		this.request = request
		this.upgraded = false
		this.payload = []
	}

	async start() {
		await this.handshake()
		return this.listen()
	}

	/**
	 * Upgrades the socket and returns true if the request succeeded
	 */
	async handshake(): Promise<boolean> {
		const upgrade = this.getHeader('upgrade')
		if (upgrade !== 'websocket')
			return this.stop(WebsocketHandshake)

		const key = this.getHeader('sec-websocket-key')
		if (! key || Array.isArray(key))
			return this.stop(WebsocketHandshake)

		this.socket.write([
			'HTTP/1.1 101 Web Socket Protocol Handshake',
			'Upgrade: WebSocket',
			'Connection: Upgrade',
			'Sec-WebSocket-Accept: ' + this.accept(key),
			'Sec-WebSocket-Protocol: json',
			'\r\n'
		].join('\r\n'))

		return true
	}

	listen() {
		if (this.listener)
			return this

		this.socket.on('data', this.listener = (buffer) => {
			this.upgraded = true
			this.receive(buffer).catch((error) => {
				console.log('receive error', error)
				this.stop()
			})
		})

		return this
	}

	send(message: WebsocketMessage) {
		if (this.upgraded)
			this.socket.write(this.build(message))
		// TODO: queue outgoing messages
	}

	/**
	 * Remove listener on stop
	 */
	async stop(error?: any) {
		if (this.listener) {
			this.socket.off('data', this.listener)
			this.listener = undefined
		}
		return super.stop(error)
	}

	private async receive(buffer: Buffer): Promise<any> {
		const message = this.parse(buffer)
		if (this.stopped)
			return null

		if (message)
			return this.server.receiveMessage(message, this)
		return null
	}

	private build(data: WebsocketMessage): Buffer {
		// Calculate payload and length description size
		const json = JSON.stringify(data)
		const payloadLength = Buffer.byteLength(json)
		const sizeLength = (payloadLength > 65535) ? 8 : (payloadLength >= 126 ? 2 : 0)

		// Write the final flag and the op code for text frame
		const buffer = Buffer.alloc(2 + sizeLength + payloadLength)
		buffer.writeUInt8(0b10000001, 0)

		if (payloadLength > 65535) {
			buffer.writeUInt8(127, 1)
			buffer.writeIntBE(payloadLength, 2, 6)
		}
		else if (payloadLength >= 126) {
			buffer.writeUInt8(126, 1)
			buffer.writeUInt16BE(payloadLength, 2)
		}
		else {
			buffer.writeUInt8(payloadLength, 1)
		}
		buffer.write(json, 2 + sizeLength, 'utf8')
		return buffer
	}

	private parse(buffer: Buffer): WebsocketMessage | null {
		// Ensure a header byte is available
		if (buffer.length < 2)
			throw InvalidWebsocketMessage

		const first = buffer.readUInt8(0)
		const final = (first & 0b10000000) > 0
		const op = first & 0b00001111
		// Termination frame or non-text frame
		if (op === 0x8) {
			this.stop()
			return null
		}
		else if (op !== 0x1) {
			this.stop()
			return null
		}

		const second = buffer.readUInt8(1)
		const masked = (second & 0b10000000) > 0

		// Payload offset and total length
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

		// Get payload with possible unmask operation
		const { payload, overflow } = this.parsePayload(buffer, offset, length, masked)

		if (final) {
			// join all received buffers into a single payload
			if (this.payload.length > 0) {
				const extended = Buffer.concat([ ...this.payload, payload ])
				this.payload = overflow.length > 0 ? [ overflow ] : []
				return this.parseJSON(extended)
			}
			else return this.parseJSON(payload)
		}
		else {
			this.payload.push(payload)
			if (overflow.length > 0)
				this.payload.push(overflow)
			return null
		}
	}

	private parseJSON(buffer: Buffer): WebsocketMessage {
		try {
			const raw = buffer.toString('utf8')
			const message = JSON.parse(raw)
			// TODO: validate message
			return message
		}
		catch (error) {
			throw InvalidWebsocketMessage
		}
	}

	private parsePayload(buffer: Buffer, offset: number, length: number, masked: boolean): { payload: Buffer, overflow: Buffer } {
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

	accept(key: string) {
		return crypto.createHash('sha1').update(key + WS_GUID).digest('base64')
	}

	getHeader(name: string) {
		return this.request.headers[name]
	}
}
