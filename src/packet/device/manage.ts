import {
	Packet,
	Payload
} from '../..'

interface DeviceEcho {
	text: string
}

export class DeviceEchoPacket extends Packet<DeviceEcho> {
	text: string

	constructor(text: string) {
		super(58, 64)
		this.willRespond()
		this.text = text.substring(0, 64)
	}

	getName() {
		return 'EchoRequest'
	}

	buildPayload(payload: Payload) {
		payload.addString(this.text, 64)
	}

	buildResponse(payload: Payload) {
		if (payload.size() != 64)
			return null

		const text = payload.getString(64)
		return { text }
	}

}

interface DeviceReboot {}

export class DeviceRebootPacket extends Packet<DeviceReboot> {

	constructor() {
		super(38, 0)
	}

	getName() {
		return 'SetReboot'
	}

	buildPayload() {}

	buildResponse() {
		return {}
	}

}
