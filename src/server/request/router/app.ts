import {
	LifxClient
} from '../../..'

import LifxRouter from '../router'

import {
	LifxDeviceRouter,
	LifxHomeRequest
} from '..'

export default class LifxAppRouter extends LifxRouter<any> {

	constructor(client: LifxClient) {
		super(client, {
			Request: LifxHomeRequest,

			route: [
				{
					path: 'device',
					Router: LifxDeviceRouter
				}
			]
		})
	}

}
