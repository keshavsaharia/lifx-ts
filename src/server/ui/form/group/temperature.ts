import UIGroupForm from '../group'

import {
	DeviceGroup,
	DeviceState,
	LightColor
} from '../../../../interface'

export default class UIGroupTemperatureForm extends UIGroupForm<LightColor> {

	constructor(group: DeviceGroup, device: Array<DeviceState>) {
		super({
			key: 'temperature',
			auto: true,
			field: [
				{
					type: 'slider',
					key: 'kelvin',
					...((device[0] && device[0].product && device[0].product.temperature) ? {
						minValue: device[0].product.temperature.min,
						maxValue: device[0].product.temperature.max
					} : { minValue: 2500, maxValue: 9000 })
				}
			]
		}, group, device)
	}
}
