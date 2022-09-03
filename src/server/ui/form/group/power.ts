import UIGroupForm from '../group'

import {
	DeviceGroup,
	DeviceState,
	DevicePower
} from '../../../../interface'

export default class UIGroupPowerForm extends UIGroupForm<DevicePower> {

	constructor(group: DeviceGroup, devices: Array<DeviceState>) {
		super({
			key: 'power',
			auto: true,
			field: [
				{
					type: 'switch',
					key: 'on',
					value: () => devices.every((device) => (device.power != null && device.power.on))
				}
			]
		}, group, devices)
	}
}
