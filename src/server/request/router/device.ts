import {
	LifxClient,
	LifxDevice
} from '../../..'

import LifxRouter from '../router'

import {
	LifxDeviceRequest,
	LifxDevicePowerRequest
} from '..'

import {
	InvalidParameter
} from '../../error'

export default class LifxDeviceRouter extends LifxRouter<LifxDevice> {

	constructor(client: LifxClient) {
		super(client)

		// Define the routing logic for device requests
		this.define({
			// Device request handler for base /device list
			Request: LifxDeviceRequest,
			// Show specific device on /device/:id
			ParamRequest: LifxDeviceRequest,

			// For posting data to the light
			route: [
				{
					path: 'power',
					param: true,
					Request: LifxDevicePowerRequest
				}
			]
		})
	}

	parameter(id: string): LifxDevice {
		const device = this.client.getDevice(id)
		if (device)
			return device
		throw InvalidParameter
	}

}
