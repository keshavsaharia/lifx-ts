import {
	Packet,
	Payload
} from '../..'

import {
	DeviceService
} from './interface'

import {
	LIFX_UDP_SERVICE
} from '../../constant'

/**
 * @class 	DeviceDiscover
 * @desc 	This packet is used for the discovery of devices on the local network.
 * 			https://lan.developer.lifx.com/docs/querying-the-device-for-data#getservice---packet-2
 */
export class DeviceDiscover extends Packet<DeviceService> {

	constructor() {
		super(2, 0)

		this.isTagged()
			.willRespond()
	}

	getName() {
		return 'GetService'
	}

	buildPayload() {
		// No payload
	}

	/**
	 * @func 	buildResponse
	 * @desc 	Parses the 5 byte payload of a StateService(3) message.
	 * 			https://lan.developer.lifx.com/docs/information-messages#stateservice---packet-3
	 */
	buildResponse(payload: Payload) {
		if (payload.size() != 5)
			return null

		// Only show discovery for service = 1 (Lifx UDP service)
		const service = payload.getByte()
		if (service != LIFX_UDP_SERVICE)
			return null

		// Is always 56700 but docs say this can't be assumed
		const port = payload.getInt()

		// Return service description
		return {
			service,
			port
		}
	}

}
