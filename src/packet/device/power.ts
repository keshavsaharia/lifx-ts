import {
	Packet,
	Payload
} from '../..'

import {
	DevicePower
} from './interface'

abstract class DevicePowerPacket extends Packet<DevicePower> {

	constructor(type: number, payload: number) {
		super(type, payload)
		this.willRespond()
	}

	buildResponse(payload: Payload) {
		const on = payload.getShort() == 0 ? false : true
		return { on }
	}

}

export class DeviceSetPower extends DevicePowerPacket {
	on: boolean

	constructor(on: boolean) {
		super(21, 2)
		this.willRespond()
		this.on = on
	}

	buildPayload(payload: Payload) {
		payload.addShort(this.on ? 65535 : 0)
	}

}

export class DeviceGetPower extends DevicePowerPacket {

	constructor() {
		super(20, 0)
		this.willRespond()
	}

	buildPayload() {}

}
