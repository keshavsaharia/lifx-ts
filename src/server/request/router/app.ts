import {
	LifxClient
} from '../../..'

import LifxRouter from '../router'

import {
	LifxDeviceRouter,
	LifxGroupRouter,
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
					path: 'group',
					Request: LifxGroupRouter,
				},
				{
					path: 'favicon',
					Request: LifxFaviconRequest
				}
			]
		})
	}

}
