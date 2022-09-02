import {
	UIPage,
	UITable,
	UILink,
	UIText,
	UISpan,
	UIForm
} from '..'

import {
	ClientState,
	DeviceState,
	DevicePower
} from '../../../interface'

export default class UIHomeView extends UIPage {
	client: ClientState
	table: UITable<DeviceState>

	constructor(client: ClientState) {
		super()
		this.addTitle('lifx')
		this.body.addClass('home')

		this.addStylesheet(['layout', 'home', 'table' ])
		this.addScript('form')

		const table = new UITable<DeviceState>({
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
					name: 'Device',
					value: (_, state) => [
						new UIForm<DevicePower>({
						   device: state,
						   key: 'power',
						   state: state.power,
						   auto: true,
						   input: [
							   {
								   type: 'checkbox',
								   key: 'on'
							   }
						   ]
					   })
					]
				}
			]
		})
		table.addRow(client.device)
		this.add(table)
	}

}
