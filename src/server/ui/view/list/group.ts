import {
	UIPage,
	UIGroupTable,
	UIDeviceTable,
	UIGroupLabelForm,
	UIGroupPowerForm,
	UIGroupTemperatureForm,
	UIGrid
} from '../..'

import {
	ClientState,
	DeviceState,
	DeviceGroup
} from '../../../../interface'

export default class UIGroupListView extends UIPage {
	client: ClientState
	groups: Array<DeviceGroup>
	devices: Array<DeviceState>
	table: UIGroupTable

	constructor(client: ClientState, groups: Array<DeviceGroup>, devices: Array<DeviceState>) {
		super()
		this.client = client
		this.devices = devices

		this.addScript([ 'lifx', 'form' ])
		this.addStylesheet(['layout', 'switch', 'slider'])

		this.add(this.table = new UIGroupTable(devices, groups))
	}



}
