import {
	LifxDevice
} from '../../..'

import LifxRequest from '../request'

import {
	Request
} from '../interface'

import {
	getString
} from '../util'

export default class LifxDeviceGroupRequest extends LifxRequest<LifxDevice> {

	async respond({ data }: Request, device: LifxDevice) {
		const id = getString('id', data)
		const label = getString('label', data)

		if (id != null && label != null)
			return this.json(await device.setGroup(id, label))
		else
			return this.badRequest()
	}

}
