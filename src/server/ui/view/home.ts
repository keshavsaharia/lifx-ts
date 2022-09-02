import {
	UIPage,
	UITable,
	UILink
} from '..'

import {
	ClientState,
	DeviceState
} from '../../../interface'

export default class UIHomeView extends UIPage {
	client: ClientState
	table: UITable<DeviceState>

	constructor(client: ClientState) {
		super()
		this.addTitle('lifx')

		const table = new UITable<DeviceState>([
			{
				name: 'Name',
				key: 'label.label',
				value: (name: string, state) =>
					new UILink().toPath('/device/' + state.mac).add(name),
				sort: true
			},
			{ name: 'IP Address', key: 'ip' },
			{ name: 'MAC Address', key: 'mac' },
			{ name: 'Port', key: 'port' }
		])
		table.addRow(client.device)
		this.add(table)
	}

}
