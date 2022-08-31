import {
	Packet,
	Payload
} from '../..'

import {
	LightColor,
	LightState
} from './interface'

abstract class LightColorPacket extends Packet<LightState> {

	constructor(type: number, payload: number) {
		super(type, payload)
		this.willRespond()
	}

	buildResponse(payload: Payload): LightState {

		const color = payload.getColor()
		const power = payload.getShort()
		payload.addOffset(2)
		const label = payload.getString(32)

		return {
			...color,
			power,
			label
		}
	}

}

export class LightSetColor extends LightColorPacket {

	color: LightColor
	duration: number

	constructor(color: LightColor, duration?: number) {
		super(102, 13)
		this.willRespond()
		this.color = color
		this.duration = duration || 0
	}

	buildPayload(payload: Payload) {
		payload.addOffset(1)
		payload.addColor(this.color)
		payload.addInt(this.duration)
	}

}

export class LightGetColor extends LightColorPacket {

	constructor() {
		super(101, 0)
		this.willRespond()
	}

	buildPayload() {}

}
