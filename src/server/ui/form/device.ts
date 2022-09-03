import UIForm from './form'

import {
	FormSchema
} from './interface'

import {
	DeviceState
} from '../../../interface'

export default class UIDeviceForm<Result> extends UIForm<Result> {

	constructor(schema: FormSchema<Result>, device: DeviceState, state?: Result) {
		super(schema, state)
		this.addClass(['device', 'device-' + schema.key])
		this.addAction('/device/' + device.mac + '/' + schema.key)
	}

}
