import {
	LifxDevice
} from '../../..'

import LifxRequest from '../request'

import {
	Request
} from '../interface'

import {
	getNumber
} from '../util'

export default class LifxDeviceTemperatureRequest extends LifxRequest<LifxDevice> {

	async respond({ data }: Request, device: LifxDevice) {
		const kelvin = getNumber('kelvin', data)
		const duration = getNumber('duration', data)

		if (kelvin == null)
			return this.badRequest()

		return this.json(await device.setTemperature(kelvin, duration))
	}

}
