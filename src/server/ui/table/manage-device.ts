import {
	UIElement,
	UILink,
	UIText,
	UIPowerForm,
	UIColorForm,
	UITemperatureForm
} from '..'

import UITable from './table'

import {
	ClientState,
	DeviceState
} from '../../../interface'

export default class UIManageDeviceTable extends UITable<DeviceState> {

	constructor(client: ClientState, groupId?: string, isLocation?: boolean) {
		super({
			columns: [
				{
					name: '',
					value: (_, device) => {
						const input = new UIElement('input').addAttr('type', 'checkbox')
						if (isLocation && device.location && groupId == device.location.id)
							input.addAttr('checked')
						else if (! isLocation && device.group && groupId == device.group.id)
							input.addAttr('checked')
						return input
					}
				},
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
					value: (ip: string, device) => [
						new UIText().addClass('ip').add(device.ip),
						new UIText().addClass('mac').add(device.mac.substring(0, 17))
					]
				}
			]
		})

		this.addClass('device-editor')
		this.addRow(client.device)
	}

}
