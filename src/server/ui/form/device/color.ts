import UIDeviceForm from '../device'

import {
	DeviceState,
	LightColor
} from '../../../../interface'

export default class UIColorForm extends UIDeviceForm<LightColor> {

	constructor(device: DeviceState) {
		super({
			key: 'color',
			auto: true,
			field: [
				{
					type: 'color',
					name: 'css'
				}
			]
		}, device, device.color)
	}

}
