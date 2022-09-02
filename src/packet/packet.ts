import {
	LifxClient,
	LifxDevice,
	Payload,
	Response
} from '..'

import {
	Transmission,
	ResultObject,
	ResponseHandler
} from '../interface'

import {
	LIFX_PROTOCOL,
	LIFX_ADDRESSABLE,
	LIFX_ORIGIN,
	BROADCAST_TARGET
} from '../constant'

/**
 * @class Packet
 * @desc  The LIFX protocol is a binary messaging protocol that is used to communicate with LIFX devices,
 * 		  sending them instructions or querying them for state.
 *
 * 		  LIFX protocol messages are structured to fit into a single UDP packet. Each LIFX protocol message
 * 		  has two components concatenated together: a header and a payload. The header contains metadata common
 * 		  to all messages and describes the type of payload to follow; the payload provides the data for the
 * 		  specific action being requested. Sometimes the action requires no data, in which case the payload
 *		  will be 0 bytes long.
 */
export default abstract class Packet<Result extends ResultObject> {
	private type: number
	private payload: Payload

	private tagged?: boolean
	private acknowledge?: boolean
	private respond?: boolean

	private handlers?: Array<ResponseHandler<Result>>

	constructor(type: number, payload: number) {
		this.type = type
		this.payload = new Payload(payload)
	}

	/**
	 * Build the payload buffer for this packet type
	 */
	abstract buildPayload(payload: Payload): any

	/**
	 * Parse the payload buffer for responses to transmissions of this packet
	 */
	abstract buildResponse(payload: Payload): Result | null

	/**
	 * Return the Lifx-assigned name of this packet
	 */
	abstract getName(): string

	emitResponse(response: Response) {
		if (this.handlers && this.handlers.length > 0) {
			const payload = this.buildResponse(response.payload)
			if (payload != null)
				this.handlers.forEach((handler) => handler(response, payload))
		}
	}

	onResponse(handler: ResponseHandler<Result>) {
		if (! this.handlers)
			this.handlers = []
		this.handlers.push(handler)
		return this
	}

	drop() {
		this.handlers = []
	}

	//
	// BUILDING A UDP PACKET
	//
	// A single Packet instance can be used to generate multiple UDP transmissions.
	// Each execution of the `build` function will increment the client sequence
	// number and generate a new Transmission object with the encoded information.
	//

	/**
	 * @func 	build
	 * @desc	Build a UDP packet for tranmission by the given client, optionally
	 * 			to only the specified device
	 */
	build(client: LifxClient, device?: LifxDevice): Transmission {
		// Build the packet payload from inherited implementation
		this.buildPayload(this.payload)
		this.payload.validateFilled()

		// Build the packet header
		const source = client.getId()
		const header = this.buildHeader(source)

		// Build the address and packet type identifier
		const sequence = client.nextSequence()
		const target = device ? device.getMacAddress() : BROADCAST_TARGET
		const address = this.buildAddress(sequence, target)
		const type = this.buildType()

		// Generate the packet and write the byte length to the first two bytes
		const buffer = Buffer.concat([ header, address, type, this.payload.buffer ])
		buffer.writeUInt16LE(buffer.length, 0)

		// Return the packet buffer along with certain data encapsulated in it
		return {
			source,
			sequence,
			buffer,
			target
		}
	}

	/**
	 * Build the LifX header
	 */
	private buildHeader(source: number): Buffer {
		const buffer = Buffer.alloc(8)
		buffer.writeUInt16LE(LIFX_PROTOCOL | (LIFX_ORIGIN << 14) | ((this.tagged ? 1 : 0) << 13) | (LIFX_ADDRESSABLE << 12), 2)
		buffer.writeUInt32LE(source, 4)
		return buffer
	}

	/**
	 * This field allows 8 bytes of data, but currently only uses the first 6.
	 * If we want to send this packet to multiple devices and have all of the respond,
	 * then we leave this as all 0s and ensure "tagged" is set to true.
	 */
	private buildAddress(sequence: number, target: string): Buffer {
		const buffer = Buffer.alloc(16)

		// Write the device MAC address, or all zeros for broadcasts, in the first 6 bytes
		// of a total allocated space of 8 bytes.
		// const target = this.target || BROADCAST_TARGET
		target.split(':').forEach((part, offset) => {
			const value = parseInt(part, 16)
			buffer.writeUInt8(value, offset)
		})

		// Write ack and response required (always 0) byte after 6 reserved bytes (at byte 14)
		buffer.writeUInt8(
			((this.acknowledge ? 1 : 0) << 1) | (this.respond ? 1 : 0), 14)

		// Write the sequence number into the final byte
		buffer.writeUInt8(sequence, 15)

		return buffer
	}

	/**
	 * Encode the packet type into a 12 byte allocated space
	 */
	private buildType(): Buffer {
		const buffer = Buffer.alloc(12)
		buffer.writeUInt16LE(this.type, 8)
		return buffer
	}

	//
	// FLAGS
	//
	// tagged - for discover packets
	// ack/res - optional
	//

	isTagged(): Packet<Result> {
		this.tagged = true
		return this
	}

	withAcknowledgement(): Packet<Result> {
		this.acknowledge = true
		return this
	}

	willRespond(): Packet<Result> {
		this.respond = true
		return this
	}

	expectsResponse() {
		//return this.acknowledge || this.respond || this.tagged
		return true
	}

}
