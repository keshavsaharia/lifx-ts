import LifxRequest from '../request'

import {
	LifxDevice
} from '../../..'

import {
	Request
} from '../interface'

import {
	UIDeviceView,
	UIDeviceListView
} from '../../ui'

export default class LifxDeviceRequest extends LifxRequest<LifxDevice> {
	
	async respond(request: Request, device?: LifxDevice) {
		const state = this.client.getState()

		// Return the device state or list of devices as a JSON object
		if (request.json)
			return this.json(device ? device.state : { device: state.device })

		// Render a device list or a specific device viewer
		return device ? this.render(new UIDeviceView(state, device.state)) :
					    this.render(new UIDeviceListView(state))
	}

}
