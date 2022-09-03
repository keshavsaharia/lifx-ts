import UIDeviceForm from '../device'

import {
	DeviceState,
	DevicePower
} from '../../../../interface'

export default class UIPowerForm extends UIDeviceForm<DevicePower> {

	constructor(device: DeviceState) {
		super({
			key: 'power',
			auto: true,
			field: [
				{
					type: 'switch',
					key: 'on'
				}
			]
		}, device, device.power)
	}
}
