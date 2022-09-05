import {
	LifxClient
} from '../../..'

import LifxRouter from '../router'

import {
	LifxDeviceRouter,
	LifxHomeRequest,
	LifxFaviconRequest
} from '..'

export default class LifxAppRouter extends LifxRouter<any> {

	constructor(client: LifxClient) {
		super(client)

		this.define({
			Request: LifxHomeRequest,

			route: [
				{
					path: 'device',
					Request: LifxDeviceRouter
				},
				{
					path: 'favicon',
					Request: LifxFaviconRequest
				}
			]
		})
	}

}
