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

export default class UIDeviceTable extends UITable<DeviceState> {

	constructor() {
		super({
			redirect: (state) => ('/device/' + state.mac),
			columns: [
				{
					name: 'Name',
					key: 'label.label',
					value: (name: string, state) => [
						new UIText().addClass('name')
							.add(new UILink().toPath('/device/' + state.mac).add(name)),
						new UIText().addClass('product')
							.add(state.product ? state.product.name : '')
					],
					sort: true
				},
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
	}

}
