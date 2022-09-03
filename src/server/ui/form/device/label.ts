import UIDeviceForm from '../device'

import {
	DeviceState,
	DeviceLabel
} from '../../../../interface'

export default class UILabelForm extends UIDeviceForm<DeviceLabel> {

	constructor(device: DeviceState) {
		super({
			key: 'label',
			field: [
				{
					type: 'text',
					label: 'Name',
					key: 'label'
				}
			]
		}, device, device.label)
	}
}
