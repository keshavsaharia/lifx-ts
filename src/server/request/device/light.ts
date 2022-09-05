import {
	LifxDevice
} from '../../..'

import LifxRequest from '../request'

import {
	Request
} from '../interface'

import {
	getBoolean
} from '../util'

export default class LifxDeviceLightRequest extends LifxRequest<LifxDevice> {

	async respond({ data }: Request, device: LifxDevice) {
		const on = getBoolean('on', data)
		return this.json(await device.setLight(on))
	}

}
