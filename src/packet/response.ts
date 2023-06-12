import dgram from 'dgram'

import {
	LifxClient,
	Payload,
	Packet
} from '..'

import {
	LIFX_PROTOCOL
} from '../constant'

import {
	ResponseProtocolError,
	ResponseLengthError
} from '../error'

export default class Response {
	request?: Packet<any>
	response: Buffer
	header: Buffer
	payload: Payload

	ip: string
	mac: string
	target: string
	protocol: number
	tagged: boolean
	source: number
	sequence: number
	type: number
	ack: boolean
	res: boolean

	constructor(response: Buffer, info: dgram.RemoteInfo) {
		this.response = response
		this.header = response.subarray(0, 36)
		this.payload = new Payload(response.subarray(36))
		this.ip = info.address

		this.parseHeader()
	}

	parseHeader() {
		const size = this.header.readUInt16LE(0)
		if(size !== this.response.length)
			throw ResponseLengthError

		// Lifx protocol number should be 1024
		this.protocol = this.header.readUInt16LE(2) & 0b111111111111
		if (this.protocol != LIFX_PROTOCOL)
			throw ResponseProtocolError

		this.tagged = (this.header.readUInt8(3) & 0b00100000) ? true : false
		this.source = this.header.readUInt32LE(4)

		// Target address of device and corresponding MAC address
		this.target = this.header.subarray(8, 16).toString('hex').toLowerCase()
		this.mac = this.target.split('')
						.map((c, i, a) => ((i % 2 == 0) ? (c + a[i + 1]) : ''))
						.filter((p) => p.length > 0).join(':')

		const ackResFlag = this.header.readUInt8(22)
		this.ack = (ackResFlag & 0b10) ? true : false;
		this.res = (ackResFlag & 0b1) ? true : false;

		// Sequence number and message type
		this.sequence = this.header.readUInt8(23)
		this.type = this.header.readUInt16LE(32)
	}

}
