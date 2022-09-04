import {
	LifxClient,
	LifxDevice
} from '../../..'

import LifxRouter from '../router'

import {
	LifxDeviceRequest,
	LifxDevicePowerRequest
} from '..'

export default class LifxDeviceRouter extends LifxRouter<LifxDevice> {

	constructor(client: LifxClient) {
		super(client, {
			Request: LifxDeviceRequest,
			route: [
				{
					path: 'power',
					Request: LifxDevicePowerRequest
				}
			]
		})
	}

}
