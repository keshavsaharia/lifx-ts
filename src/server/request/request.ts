import {
	LifxClient
} from '../..'

import {
	Request,
	Response
} from './interface'

import {
	UIElement
} from '../ui'

import {
	ResourceNotFound
} from '../error'

import {
	getStaticResource,
	getMimeType
} from '../ui/util'

export default abstract class LifxRequest<Param> {
	protected client: LifxClient
	protected request: Request
	protected param?: Param

	// Response parameters
	statusCode?: number

	constructor(client: LifxClient, request: Request, param?: Param) {
		this.client = client
		this.request = request
		this.param = param
	}

	abstract respond(request: Request, param?: Param): Promise<Response>

	protected shiftPath() {
		if (this.request.path.length > 0)
			return this.request.path.shift()
		return null
	}

	protected render(element: UIElement): Response {
		return {
			type: 'text/html',
			body: element.render()
		}
	}

	protected resource(resourcePath: string): Response {
		const resource = getStaticResource(resourcePath)
		if (! resource)
			throw ResourceNotFound

		return {
			type: getMimeType(resourcePath),
			body: resource
		}
	}

	protected json(data: any): Response {
		return {
			type: 'application/json',
			body: JSON.stringify(data)
		}
	}

	protected redirect(redirect: string): Response {
		return {
			redirect
		}
	}

	protected notFound(error?: any): Response {
		return {
			status: 404,
			type: 'application/json',
			body: JSON.stringify(error || {})
		}
	}

	// private async respondToGet() {
	// 	const resource = this.shiftPath()
	//
	// 	if (resource === 'favicon') {
	// 		return this.resource('/favicon/' + this.shiftPath())
	// 	}
	// 	else if (resource === 'device') {
	// 		const deviceId = this.shiftPath()
	//
	// 		if (! deviceId) {
	// 			return this.render(new UIDeviceListView(this.client.getState()))
	// 		}
	// 		else if (this.client.hasDevice(deviceId)) {
	// 			const device = this.client.getDevice(deviceId)
	// 			return this.render(new UIDeviceView(this.client.getState(), device.getState()))
	// 		}
	// 		else {
	// 			// device not found
	// 			return this.redirect('/device')
	// 		}
	// 	}
	// 	else if (resource === 'group' || resource === 'location') {
	// 		const groupId = this.shiftPath()
	// 		const isLocation = (resource === 'location')
	//
	// 		if (! groupId) {
	// 			return this.render(new UIGroupListView(this.client.getState()))
	// 		}
	// 		else {
	// 			const devices = (isLocation) ? this.client.getLocation(groupId) : this.client.getGroup(groupId)
	//
	// 			if (devices.length > 0)
	// 				return this.render(new UIDeviceListView(this.client.getState(), groupId, isLocation))
	// 			else
	// 				return this.render(new UIGroupCreateView(this.client.getState(), groupId, isLocation))
	// 		}
	// 	}
	// 	// else return this.render(new UIErrorView(this.client.getState()))
	// 	else throw ResourceNotFound
	// }
	//
	// private async respondToPost() {
	// 	const resource = this.shiftPath()
	// 	const data = await this.getData()
	//
	// 	if (! resource) {
	// 		// client update
	// 		return this.redirect('/')
	// 	}
	// 	else if (resource === 'device') {
	// 		const deviceId = this.shiftPath()
	//
	// 		if (deviceId && this.client.hasDevice(deviceId)) {
	// 			const device = this.client.getDevice(deviceId)
	// 			const key = this.shiftPath()
	//
	// 			if (key) {
	// 				return this.respondToDevicePost(device, key, data)
	// 			}
	// 			else throw {}
	// 		}
	// 		else throw {}
	// 	}
	// 	else throw {}
	// }
	//
	// private async respondToDevicePost(device: LifxDevice, key: string, data: { [key: string]: any }) {
	// 	let result: any = null
	//
	// 	if (key === 'power')
	// 		result = await device.setPower(data.on === 'true')
	// 	else if (key === 'light')
	// 		result = await device.setLight(this.parseBoolean(data.on), this.parseNumber(data.duration))
	// 	else if (key === 'infrared')
	// 		result = await device.setInfrared(this.parseNumber(data.brightness) || 0)
	// 	else if (key === 'color')
	// 		result = await this.respondToDeviceColorPost(device, data)
	// 	else if (key === 'temperature')
	// 		result = await this.respondToDeviceTemperaturePost(device, data)
	// 	else if (key === 'label')
	// 		result = await device.setLabel(this.parseString(data.label) || '')
	// 	else if (key === 'location' || key === 'group')
	// 		result = await this.respondToDeviceGroupPost(device, key, data)
	//
	// 	if (this.query.json)
	// 		return this.json(result || {})
	// 	else
	// 		return this.redirect('/device/' + device.getMacAddress())
	// }
	//
	// private async respondToDeviceColorPost(device: LifxDevice, data: { [key: string]: any }) {
	// 	if (data.css) {
	// 		const css = this.parseString(data.css)
	// 		const kelvin = this.parseNumber(data.kelvin)
	// 		if (css)
	// 			return device.setCSS(css, kelvin)
	// 	}
	// 	else if (data.r != null && data.g != null && data.b != null) {
	// 		const r = this.parseNumber(data.r)
	// 		const g = this.parseNumber(data.g)
	// 		const b = this.parseNumber(data.b)
	// 		const a = this.parseNumber(data.a)
	// 		const kelvin = this.parseNumber(data.kelvin)
	//
	// 		if (r != null && g != null && b != null)
	// 			return device.setRGB(r, g, b, a, kelvin)
	// 	}
	// 	return null
	// }
	//
	// private async respondToDeviceTemperaturePost(device: LifxDevice, data: { [key: string]: any }) {
	// 	const color = await device.getColor()
	// 	const kelvin = this.parseNumber(data.kelvin)
	// 	if (color && kelvin != null)
	// 		return device.setColor({
	// 			...color,
	// 			kelvin
	// 		})
	// 	return null
	// }
	//
	// private async respondToDeviceGroupPost(device: LifxDevice, key: string, data: { [key: string]: any }) {
	// 	const id = this.parseString(data.id)
	// 	const label = this.parseString(data.label)
	// 	if (id != null && label != null) {
	// 		if (key === 'group')
	// 			return device.setGroup(id, label)
	// 		else
	// 			return device.setLocation(id, label)
	// 	}
	// 	return null
	// }


}
