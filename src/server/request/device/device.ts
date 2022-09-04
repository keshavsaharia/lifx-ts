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

export default class GetDeviceRequest extends LifxRequest<LifxDevice> {

	protected getParam(id: string): LifxDevice | undefined {
		if (this.client.hasDevice(id))
			return this.client.getDevice(id)
		return undefined
	}

	async respond(request: Request, device?: LifxDevice) {
		const state = this.client.getState()

		if (request.json)
			return this.json(device ? device.state : { device: state.device })

		return device ? this.render(new UIDeviceView(state, device.state)) :
					    this.render(new UIDeviceListView(state))
	}

}
