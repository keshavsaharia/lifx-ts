import {
	Packet,
	Payload
} from '../..'

import {
	LightPower
} from './interface'

abstract class LightPowerPacket extends Packet<LightPower> {

	constructor(type: number, payload: number) {
		super(type, payload)
		this.willRespond()
	}

	buildResponse(payload: Payload) {
		const level = payload.getRatio()
		return { level }
	}

}

export class LightSetPower extends LightPowerPacket {
	on: boolean
	duration?: number

	constructor(on: boolean, duration?: number) {
		super(21, 2)
		this.willRespond()
		this.on = on
		this.duration = duration
	}

	buildPayload(payload: Payload) {
		payload.addShort(this.on ? 65535 : 0)
		payload.addInt(this.duration || 0)
	}

}

export class LightGetPower extends LightPowerPacket {

	constructor() {
		super(20, 0)
		this.willRespond()
	}

	buildPayload() {}

}
