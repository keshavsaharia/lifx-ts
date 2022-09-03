import UIDeviceForm from './device'

import {
	DeviceState,
	LightColor
} from '../../../interface'

export default class UITemperatureForm extends UIDeviceForm<LightColor> {

	constructor(device: DeviceState) {
		super({
			key: 'temperature',
			auto: true,
			field: [
				{
					type: 'slider',
					key: 'kelvin',
					...((device.product && device.product.temperature) ? {
						minValue: device.product.temperature.min,
						maxValue: device.product.temperature.max
					} : { minValue: 2500, maxValue: 9000 })
				}
			]
		}, device, device.color)
	}
}
