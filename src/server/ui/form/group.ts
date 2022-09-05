import UIForm from './form'

import {
	FormSchema
} from './interface'

import {
	DeviceGroup,
	DeviceState
} from '../../../interface'

export default class UIGroupForm<Result> extends UIForm<Result> {
	group: DeviceGroup
	device: Array<DeviceState>

	constructor(schema: FormSchema<Result>, group: DeviceGroup, device: Array<DeviceState>, state?: Result) {
		super(schema, state)
		this.group = group
		this.device = device.filter((d) => (d.group && d.group.id == group.id))

		// Add group/location classes
		this.addClass(group.location ? 'location' : 'group')

		// Set the form action
		this.addAction('/' + [ group.location ? 'location' : 'group', group.id, schema.key ].join('/'))
	}

}
