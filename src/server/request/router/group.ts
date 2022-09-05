import crypto from 'crypto'

import {
	LifxClient
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

export default class LifxGroupRouter extends LifxRouter<DeviceGroup> {

	constructor(client: LifxClient) {
		super(client)

		// Define the routing logic for group requests
		this.define({
			// Device request handler for base /group list
			Request: LifxGroupRequest,
			// Show specific group on /group/:id
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

		// Create a new group
		return {
			id: crypto.randomBytes(16).toString('hex'),
			label: 'New Group',
			updated: Date.now()
		}
	}

}
