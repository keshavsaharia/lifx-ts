import LifxRequest from '../request'

import {
	LifxDevice
} from '../../..'

import {
	Request
} from '../interface'

import {
	DeviceGroup
} from '../../../interface'

import {
	UIGroupListView,
	UIGroupView
} from '../../ui'

export default class LifxGroupRequest extends LifxRequest<DeviceGroup> {

	async respond(request: Request, group?: DeviceGroup) {
		const state = this.client.getState()

		// Return the device state or list of devices as a JSON object
		if (request.json)
			return this.json(group || {})

		// Render a device list or a specific device viewer
		return group ? this.render(new UIGroupView(state, group)) :
					   this.render(new UIGroupListView(state))
	}

}
