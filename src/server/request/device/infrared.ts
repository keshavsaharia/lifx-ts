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

export default class LifxDeviceInfraredRequest extends LifxRequest<LifxDevice> {

	async respond({ data }: Request, device: LifxDevice) {
		const brightness = getNumber('brightness', data)
		if (brightness == null)
			return this.badRequest()

		return this.json(await device.setInfrared(brightness))
	}

}
