import {
	LifxClient,
	LifxDevice
} from '../../..'

import LifxRouter from '../router'

import {
	LifxGroupRequest,
	LifxGroupPowerRequest,
	LifxGroupColorRequest,
	LifxGroupTemperatureRequest
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
			route: [
				{
					path: 'power',
					param: true,
					Request: LifxGroupPowerRequest
				},
				{
					path: 'color',
					param: true,
					Request: LifxGroupColorRequest
				},
				{
					path: 'temperature',
					param: true,
					Request: LifxGroupTemperatureRequest
				}
			]
		})
	}

	parameter(id: string): DeviceGroup {
		const group = this.client.getGroup(id)
		if (group.length > 0)
			return group[0].group!
		throw InvalidParameter
	}

}
