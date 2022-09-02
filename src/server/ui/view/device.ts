import {
	UIPage,
	UIForm,
	UIElement
} from '..'

import {
	ClientState,
	DeviceState,
	DevicePower,
	DeviceLabel
} from '../../../interface'

export default class UIDeviceView extends UIPage {
	client: ClientState
	device: DeviceState

	constructor(client: ClientState, device: DeviceState) {
		super()
		this.client = client
		this.device = device
		this.addScript('form')
		this.addTitle(device.label ? ('lifx - ' + device.label.label) : 'lifx device')

		const labelForm = new UIForm<DeviceLabel>({
			device,
			key: 'label',
			state: device.label,
			input: [
				{
					type: 'text',
					label: 'Name',
					key: 'label'
				}
			]
		})

		this.add(labelForm)

		const form = new UIForm<DevicePower>({
			device,
			key: 'power',
			state: device.power,
			auto: true,
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
