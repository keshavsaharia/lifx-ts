import {
	UILink,
	UIText,
	UIPowerForm,
	UIColorForm,
	UITemperatureForm
} from '..'

import UITable from './table'

import {
	DeviceState
} from '../../../interface'

import {
	deviceName
} from './schema'

export default class UIDeviceTable extends UITable<DeviceState> {

	constructor(rows?: Array<DeviceState>) {
		super({
			redirect: (state) => ('/device/' + state.mac),
			columns: [
				deviceName('Device'),
				{
					name: 'Network',
					key: 'ip',
					value: (ip: string, state) => [
						new UIText().addClass('ip').add(state.ip),
						new UIText().addClass('mac').add(state.mac.substring(0, 17))
					]
				},
				{
					name: 'Power',
					value: (_, state) => [
						new UIPowerForm(state).stopPropagation()
					]
				},
				{
					name: 'Color',
					value: (_, state) => [
						new UIColorForm(state).stopPropagation()
					]
				},
				{
					name: 'Temperature',
					value: (_, state) => [
						new UITemperatureForm(state).stopPropagation()
					]
				}
			]
		})

		if (rows)
			this.addRow(rows)
	}

}
