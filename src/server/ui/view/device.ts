import {
	UIPage,
	UIForm,
	UIElement
} from '..'

import {
	ClientState,
	DeviceState,
	DevicePower
} from '../../../interface'

export default class UIDeviceView extends UIPage {
	client: ClientState
	device: DeviceState

	constructor(client: ClientState, device: DeviceState) {
		super()
		this.client = client
		this.device = device

		this.addTitle(device.label ? ('lifx - ' + device.label.label) : 'lifx device')

		const form = new UIForm<DevicePower>({
			device,
			key: 'power',
			state: device.power,
			input: [
				{
					type: 'checkbox',
					label: 'Power',
					key: 'on'
				}
			]
		})

		this.add(form)
	}



}
