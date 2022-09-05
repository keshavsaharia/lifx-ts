import {
	LifxDevice
} from '../../..'

import LifxRequest from '../request'

import {
	Request
} from '../interface'

export default class LifxDeviceLightRequest extends LifxRequest<LifxDevice> {

	async respond(request: Request, device: LifxDevice) {
		if (! request.data)
			return this.notFound()

		return this.json(await device.setLight(request.data.on === 'true'))
	}

}
