import UIGroupForm from '../group'

import {
	DeviceGroup,
	DeviceState,
	LightColor
} from '../../../../interface'

export default class UIColorForm extends UIGroupForm<LightColor> {

	constructor(group: DeviceGroup, devices: Array<DeviceState>) {
		super({
			key: 'color',
			auto: true,
			field: [
				{
					type: 'color',
					name: 'css'
				}
			]
		}, group, devices)
	}

}
