import UIGroupForm from '../group'

import {
	DeviceState,
	DeviceGroup
} from '../../../../interface'

export default class UIGroupLabelForm extends UIGroupForm<DeviceGroup> {

	constructor(group: DeviceGroup, devices: Array<DeviceState>) {
		super({
			key: 'label',
			field: [
				{
					type: 'text',
					label: 'Group name',
					key: 'label'
				}
			]
		}, group, devices)
	}
}
