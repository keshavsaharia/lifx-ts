import LifxRequest from '../request'

import {
	Request
} from '../interface'

import {
	DeviceGroup
} from '../../../interface'

import {
	getNumber
} from '../util'

export default class LifxGroupTemperatureRequest extends LifxRequest<DeviceGroup> {

	async respond({ data }: Request, group: DeviceGroup) {
		const kelvin = getNumber('kelvin', data)
		const duration = getNumber('duration', data)

		if (kelvin == null)
			return this.badRequest()

		return this.json(await Promise.all(this.client.getGroup(group)
			.map((device) => device.setTemperature(kelvin, duration))))
	}

}
