import {
	UIPage,
	UILabelForm,
	UIPowerForm,
	UITemperatureForm,
	UIGrid
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
		this.addScript([ 'lifx', 'form' ])
		this.addStylesheet(['layout', 'switch', 'slider'])
		this.addTitle(device.label ? ('lifx - ' + device.label.label) : 'lifx device')

		const grid = new UIGrid()
		grid.addColumn(30)
			.add(new UILabelForm(device))
		grid.addColumn(70)
			.add(new UIPowerForm(device))
			.add(new UITemperatureForm(device))
		this.add(grid)
	}



}
