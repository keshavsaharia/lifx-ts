import {
	Packet,
	Payload
} from '../..'

import {
	DeviceLabel
} from './interface'

abstract class DeviceLabelPacket extends Packet<DeviceLabel> {

	constructor(type: number, payload: number) {
		super(type, payload)
		this.willRespond()
	}

	buildResponse(payload: Payload) {
		const label = payload.getString(32)
		return { label }
	}

}

export class DeviceSetLabel extends DeviceLabelPacket {
	label: string

	constructor(label: string) {
		super(24, 32)
		this.label = label.substring(0, 32)
	}

	buildPayload(payload: Payload) {
		payload.addString(this.label, 32)
	}

}

export class DeviceGetLabel extends DeviceLabelPacket {

	constructor() {
		super(23, 0)
	}

	buildPayload() {}

}
