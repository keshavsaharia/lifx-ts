import {
	LifxClient,
	LifxDevice
} from '../../..'

import LifxRouter from '../router'

import {
	LifxDeviceRequest,
	LifxDevicePowerRequest,
	LifxDeviceLightRequest,
	LifxDeviceColorRequest,
	LifxDeviceTemperatureRequest,
	LifxDeviceGroupRequest,
	LifxDeviceLabelRequest,
	LifxDeviceLocationRequest
} from '..'

import {
	InvalidParameter
} from '../../error'

export default class LifxDeviceRouter extends LifxRouter<LifxDevice> {

	constructor(client: LifxClient) {
		super(client)

		// Define the routing logic for device requests
		this.define({
			// Device request handler for base /device list
			Request: LifxDeviceRequest,
			// Show specific device on /device/:id
			ParamRequest: LifxDeviceRequest,

			// For posting data to the light
			route: [
				{
					path: 'power',
					param: true,
					Request: LifxDevicePowerRequest
				},
				{
					path: 'light',
					param: true,
					Request: LifxDeviceLightRequest
				},
				{
					path: 'color',
					param: true,
					Request: LifxDeviceColorRequest
				},
				{
					path: 'temperature',
					param: true,
					Request: LifxDeviceTemperatureRequest
				},
				{
					path: 'label',
					param: true,
					Request: LifxDeviceLabelRequest
				},
				{
					path: 'group',
					param: true,
					Request: LifxDeviceGroupRequest
				},
				{
					path: 'location',
					param: true,
					Request: LifxDeviceLocationRequest
				}
			]
		})
	}

	parameter(id: string): LifxDevice {
		const device = this.client.getDevice(id)
		if (device)
			return device
		throw InvalidParameter
	}

}
