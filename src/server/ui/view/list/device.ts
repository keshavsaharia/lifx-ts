import {
	UIPage,
	UIDeviceTable
} from '../..'

import {
	ClientState,
	DeviceGroup
} from '../../../../interface'

export default class UIDeviceListView extends UIPage {
	client: ClientState
	table: UIDeviceTable

	constructor(client: ClientState, group?: string, location?: boolean) {
		super()
		this.client = client

		this.addScript([ 'lifx', 'form' ])
		this.addStylesheet(['layout', 'switch', 'slider'])

		let devices = client.device
		if (group) {
			if (location)
				devices = devices.filter((device) => (device.location && device.location.id == group))
			else
				devices = devices.filter((device) => (device.group && device.group.id == group))
		}
		this.add(this.table = new UIDeviceTable(devices))
	}



}
