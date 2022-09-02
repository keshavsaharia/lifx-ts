import {
	Packet,
	Payload
} from '../..'

import {
	DeviceGroup
} from './interface'

abstract class DeviceGroupPacket extends Packet<DeviceGroup> {

	constructor(type: number, payload: number) {
		super(type, payload)
		this.willRespond()
	}

	buildResponse(payload: Payload) {
		const id = payload.getUUID(16)
		const label = payload.getString(32)
		const updated = payload.getTimestamp()

		return {
			id,
			label,
			updated
		}
	}

}

export class DeviceSetLocation extends DeviceGroupPacket {
	id: string
	label: string

	constructor(id: string, label: string) {
		super(49, 56)
		this.id = id
		this.label = label
	}

	getName() {
		return 'SetLocation'
	}

	buildPayload(payload: Payload) {
		payload.addString(this.id, 16)
		payload.addString(this.label, 32)
		payload.addTimestamp()
	}
}

export class DeviceGetLocation extends DeviceGroupPacket {

	constructor() {
		super(48, 0)
	}

	getName() {
		return 'GetLocation'
	}

	buildPayload() {}
}

export class DeviceSetGroup extends DeviceGroupPacket {
	id: string
	label: string

	constructor(id: string, label: string) {
		super(52, 56)
		this.id = id
		this.label = label
	}

	getName() {
		return 'SetGroup'
	}

	buildPayload(payload: Payload) {
		payload.addString(this.id, 16)
		payload.addString(this.label, 32)
		payload.addTimestamp()
	}
}


export class DeviceGetGroup extends DeviceGroupPacket {

	constructor() {
		super(51, 0)
	}

	getName() {
		return 'GetGroup'
	}

	buildPayload() {}

}
