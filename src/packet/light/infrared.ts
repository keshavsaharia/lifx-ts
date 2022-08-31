import {
	Packet,
	Payload
} from '../..'

import {
	LightInfrared
} from './interface'

abstract class LightInfraredPacket extends Packet<LightInfrared> {

	constructor(type: number, payload: number) {
		super(type, payload)
		this.willRespond()
	}

	buildResponse(payload: Payload): LightInfrared {
		const brightness = payload.getShort() / 65535

		return {
			brightness
		}
	}

}

export class LightSetInfrared extends LightInfraredPacket {

	brightness: number

	constructor(brightness: number) {
		super(122, 2)
		this.brightness = brightness
	}

	buildPayload(payload: Payload) {
		payload.addRatio(this.brightness)
	}

}

export class LightGetInfrared extends LightInfraredPacket {

	constructor() {
		super(120, 0)
	}

	buildPayload() {}

}
