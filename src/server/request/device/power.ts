import {
	LifxDevice
} from '../../..'

import LifxRequest from '../request'

import {
	Request
} from '../interface'

export default class LifxDevicePowerRequest extends LifxRequest<LifxDevice> {

	async respond(request: Request, device: LifxDevice) {
		if (! request.data)
			return this.notFound()

		return this.json(await device.setPower(request.data.on === 'true'))
	}

}
