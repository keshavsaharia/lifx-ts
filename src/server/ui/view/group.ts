import {
	UIPage,
	UIGroupLabelForm,
	UIGroupPowerForm,
	UIGroupTemperatureForm,
	UIGrid
} from '..'

import {
	ClientState,
	DeviceState,
	DeviceGroup
} from '../../../interface'

export default class UIGroupView extends UIPage {
	client: ClientState
	group: DeviceGroup

	constructor(client: ClientState, group: DeviceGroup) {
		super()
		this.client = client
		this.group = group

		this.addScript([ 'lifx', 'form' ])
		this.addStylesheet(['layout', 'switch', 'slider'])

		this.addTitle('lifx - ' + group.label)

		const grid = new UIGrid()
		grid.addColumn(30)
			.add(new UIGroupLabelForm(group, client.device))
		grid.addColumn(70)
			.add(new UIGroupPowerForm(group, client.device))
			.add(new UIGroupTemperatureForm(group, client.device))
		this.add(grid)
	}



}
