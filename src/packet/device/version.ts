import {
	Packet,
	Payload
} from '../..'

import {
	DeviceVersion
} from './interface'

export class DeviceGetVersion extends Packet<DeviceVersion> {

	constructor() {
		super(32, 0)
		this.willRespond()
	}

	getName() {
		return 'GetVersion'
	}

	buildPayload() {}

	buildResponse(payload: Payload) {
		const vendor = payload.getInt()
		const product = payload.getInt()

		return {
			vendor,
			product
		}
	}
}
