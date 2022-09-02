import {
	UIPage
} from '..'

import {
	ClientState,
	DeviceState
} from '../../../interface'

export default class UIDeviceView extends UIPage {
	client: ClientState
	device: DeviceState

	constructor(client: ClientState, device: DeviceState) {
		super()
		this.client = client
		this.device = device

		this.addTitle(device.label ? ('lifx - ' + device.label.label) : 'lifx device')
	}

}
