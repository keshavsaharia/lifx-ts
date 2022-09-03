import {
	UIPage,
	UIDeviceTable,
	UIGroupTable
} from '..'

import {
	ClientState,
	DeviceState
} from '../../../interface'

export default class UIHomeView extends UIPage {
	client: ClientState
	deviceTable: UIDeviceTable
	groupTable: UIGroupTable

	constructor(client: ClientState) {
		super()
		this.client = client
		this.addTitle('lifx')
		this.body.addClass('home')

		this.addStylesheet(['layout', 'home', 'table', 'switch', 'slider' ])
		this.addScript(['lifx', 'form'])

		this.add(this.groupTable = new UIGroupTable(client.device))
		this.groupTable.addRow(client.group)

		this.add(this.deviceTable = new UIDeviceTable())
		this.deviceTable.addRow(client.device)
	}

}
