import {
	UIText,
	UILink
} from '..'

import {
	TableKey
} from './interface'

import {
	DeviceState
} from '../../../interface'

export function deviceName(name: string): TableKey<DeviceState> {
	return {
		name,
		key: 'label.label',
		value: (name: string, device) => [
			new UIText().addClass('name')
				.add(new UILink().toPath('/device/' + device.mac).add(name)),
			new UIText().addClass('product')
				.add(device.product ? device.product.name : '')
		],
		sort: true
	}
}
