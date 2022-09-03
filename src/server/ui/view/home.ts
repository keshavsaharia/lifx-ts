import {
	UIPage,
	UIDeviceTable
} from '..'

import {
	ClientState,
	DeviceState
} from '../../../interface'

export default class UIHomeView extends UIPage {
	client: ClientState
	deviceTable: UIDeviceTable

	constructor(client: ClientState) {
		super()
		this.client = client
		this.addTitle('lifx')
		this.body.addClass('home')

		this.addStylesheet(['layout', 'home', 'table', 'switch', 'slider' ])
		this.addScript(['lifx', 'form'])

		this.add(this.deviceTable = new UIDeviceTable())
		this.deviceTable.addRow(client.device)
	}

}
