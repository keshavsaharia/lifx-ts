import {
	Packet,
	Payload
} from '../..'

import {
	DeviceInfo
} from './interface'

export class DeviceGetInfo extends Packet<DeviceInfo> {

	constructor() {
		super(34, 0)
	}

	buildPayload() {}

	buildResponse(payload: Payload) {
		if (payload.size() != 24)
			return null

		const time = payload.getTimestamp()
		const uptime = payload.getTimestamp()
		const downtime = payload.getTimestamp()

		return {
			time,
			uptime,
			downtime
		}
	}
}
