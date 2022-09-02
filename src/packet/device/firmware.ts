import {
	Packet,
	Payload
} from '../..'

import {
	DeviceFirmware
} from './interface'

export class DeviceGetFirmware extends Packet<DeviceFirmware> {
	wifi?: boolean

	constructor(wifi?: boolean) {
		super(wifi ? 18 : 14, 0)
		this.wifi = wifi
		this.willRespond()
	}

	getName() {
		return this.wifi ? 'GetWifiFirmware' : 'GetFirmware'
	}

	buildPayload() {}

	buildResponse(payload: Payload) {
		if (payload.size() != 20)
			return null

		const build = payload.getTimestamp()
		payload.addOffset(8)
		const version_minor = payload.getShort()
		const version_major = payload.getShort()

		return {
			build,
			version_minor,
			version_major
		}
	}
}
