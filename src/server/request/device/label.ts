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

export default class LifxDeviceLabelRequest extends LifxRequest<LifxDevice> {

	async respond({ data }: Request, device: LifxDevice) {
		const label = getString('label', data)

		if (label != null)
			return this.json(await device.setLabel(label))
		else
			return this.badRequest()
	}

}
