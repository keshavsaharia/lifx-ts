import {
	UILink,
	UIText,
	UIGroupPowerForm,
	UIGroupColorForm,
	UIGroupTemperatureForm
} from '..'

import UITable from './table'

import {
	DeviceState,
	DeviceGroup
} from '../../../interface'

export default class UIGroupTable extends UITable<DeviceGroup> {

	constructor(devices: Array<DeviceState>, groups?: Array<DeviceGroup>) {
		super({
			redirect: (state) => ('/group/' + state.id),
			columns: [
				{
					name: 'Name',
					key: 'label',
					value: (name: string, state) => [
						new UIText().addClass('name')
							.add(new UILink().toPath('/group/' + state.id).add(name))
					],
					sort: true
				},
				{
					name: 'Power',
					value: (_, state) => [
						new UIGroupPowerForm(state, devices).stopPropagation()
					]
				},
				{
					name: 'Color',
					value: (_, state) => [
						new UIGroupColorForm(state, devices).stopPropagation()
					]
				},
				{
					name: 'Temperature',
					value: (_, state) => [
						new UIGroupTemperatureForm(state, devices).stopPropagation()
					]
				}
			]
		})

		if (groups)
			this.addRow(groups)
	}

}
