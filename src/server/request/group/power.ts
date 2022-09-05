import {
	LifxDevice
} from '../../..'

import LifxRequest from '../request'

import {
	Request
} from '../interface'

import {
	DeviceGroup
} from '../../../interface'

import {
	getBoolean
} from '../util'

export default class LifxGroupPowerRequest extends LifxRequest<DeviceGroup> {

	async respond({ data }: Request, group: DeviceGroup) {
		const on = getBoolean('on', data)
		await Promise.all(this.client.getGroup(group).map((device) => device.setPower(on)))
		return this.json({ on })
	}

}
