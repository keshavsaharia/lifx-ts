import {
	LifxClient,
	LifxDevice
} from '../../..'

import LifxRouter from '../router'

import {
	LifxGroupRequest
} from '..'

import {
	DeviceGroup
} from '../../../interface'

import {
	InvalidParameter
} from '../../error'

export default class LifxGroupRouter extends LifxRouter<DeviceGroup> {

	constructor(client: LifxClient) {
		super(client)

		// Define the routing logic for device requests
		this.define({
			// Device request handler for base /device list
			Request: LifxGroupRequest,
			// Show specific device on /device/:id
			ParamRequest: LifxGroupRequest,

			// For posting data to the group
			// route: [
			// 	{
			// 		path: 'power',
			// 		param: true,
			// 		Request: LifxDevicePowerRequest
			// 	},
			// 	{
			// 		path: 'light',
			// 		param: true,
			// 		Request: LifxDeviceLightRequest
			// 	},
			// 	{
			// 		path: 'color',
			// 		param: true,
			// 		Request: LifxDeviceColorRequest
			// 	}
			// ]
		})
	}

	parameter(id: string): DeviceGroup {
		const group = this.client.getGroup(id)
		if (group.length > 0)
			return group[0].group!
		throw InvalidParameter
	}

}
