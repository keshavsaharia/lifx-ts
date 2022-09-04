import {
	LifxClient,
	LifxDevice
} from '..'

import {
	UIElement,
	UIHomeView,
	UIDeviceView,
	UIDeviceListView,
	UIGroupListView,
	UIGroupCreateView,
	UIErrorView
} from './ui'

import {
	ResourceNotFound
} from './error'

import {
	getStaticResource,
	getMimeType
} from './ui/util'

import http from 'http'
import url from 'url'
import qs from 'querystring'

export default class Request {
	client: LifxClient
	request: http.IncomingMessage
	response: http.ServerResponse
	responded: boolean

	method: string
	path: Array<string>
	query: qs.ParsedUrlQuery

	constructor(client: LifxClient, request: http.IncomingMessage, response: http.ServerResponse) {
		this.client = client
		this.request = request
		this.response = response
		this.responded = false
	}

	static receive(client: LifxClient, request: http.IncomingMessage, response: http.ServerResponse): Request {
		return new Request(client, request, response)
	}

	async respond() {
		this.parseRequest()

		if (this.isGet())
			return this.respondToGet()
		else if (this.isPost())
			return this.respondToPost()
		else
			throw {}
	}

	private render(element: UIElement): Request {
		this.responded = true
		this.response.writeHead(200, {
			'Content-Type': 'text/html',
			'Connection': 'close'
		})
		this.response.end(element.render())
		return this
	}

	private resource(resourcePath: string) {
		const resource = getStaticResource(resourcePath)
		if (! resource)
			return this.notFound()

		this.responded = true
		this.response.writeHead(200, {
			'Content-Type': getMimeType(resourcePath),
			'Connection': 'close'
		})
		this.response.end(resource)
		return this
	}

	private json(data: any): Request {
		this.responded = true
		this.response.writeHead(200, {
			'Content-Type': 'application/json',
			'Connection': 'close'
		})
		this.response.end(JSON.stringify(data))
		return this
	}

	private redirect(redirect: string) {
		this.responded = true
		this.response.writeHead(303, {
			location: redirect
		})
		this.response.end()
		return this
	}

	private notFound() {
		this.responded = true
		this.response.writeHead(404)
		this.response.end()
		return this
	}

	private async respondToGet() {
		const resource = this.shiftPath()

		if (! resource) {
			return this.render(new UIHomeView(this.client.getState()))
		}
		else if (resource === 'favicon') {
			return this.resource('/favicon/' + this.shiftPath())
		}
		else if (resource === 'device') {
			const deviceId = this.shiftPath()

			if (! deviceId) {
				return this.render(new UIDeviceListView(this.client.getState()))
			}
			else if (this.client.hasDevice(deviceId)) {
				const device = this.client.getDevice(deviceId)
				return this.render(new UIDeviceView(this.client.getState(), device.getState()))
			}
			else {
				// device not found
				return this.redirect('/device')
			}
		}
		else if (resource === 'group' || resource === 'location') {
			const groupId = this.shiftPath()
			const isLocation = (resource === 'location')

			if (! groupId) {
				return this.render(new UIGroupListView(this.client.getState()))
			}
			else {
				const devices = (isLocation) ? this.client.getLocation(groupId) : this.client.getGroup(groupId)

				if (devices.length > 0)
					return this.render(new UIDeviceListView(this.client.getState(), groupId, isLocation))
				else
					return this.render(new UIGroupCreateView(this.client.getState(), groupId, isLocation))
			}
		}
		// else return this.render(new UIErrorView(this.client.getState()))
		else throw ResourceNotFound
	}

	private async respondToPost() {
		const resource = this.shiftPath()
		const data = await this.getData()

		if (! resource) {
			// client update
			return this.redirect('/')
		}
		else if (resource === 'device') {
			const deviceId = this.shiftPath()

			if (deviceId && this.client.hasDevice(deviceId)) {
				const device = this.client.getDevice(deviceId)
				const key = this.shiftPath()

				if (key) {
					return this.respondToDevicePost(device, key, data)
				}
				else throw {}
			}
			else throw {}
		}
		else throw {}
	}

	private async respondToDevicePost(device: LifxDevice, key: string, data: { [key: string]: any }) {
		let result: any = null

		if (key === 'power')
			result = await device.setPower(data.on === 'true')
		else if (key === 'light')
			result = await device.setLight(this.parseBoolean(data.on), this.parseNumber(data.duration))
		else if (key === 'infrared')
			result = await device.setInfrared(this.parseNumber(data.brightness) || 0)
		else if (key === 'color')
			result = await this.respondToDeviceColorPost(device, data)
		else if (key === 'temperature')
			result = await this.respondToDeviceTemperaturePost(device, data)
		else if (key === 'label')
			result = await device.setLabel(this.parseString(data.label) || '')
		else if (key === 'location' || key === 'group')
			result = await this.respondToDeviceGroupPost(device, key, data)

		if (this.query.json)
			return this.json(result || {})
		else
			return this.redirect('/device/' + device.getMacAddress())
	}

	private async respondToDeviceColorPost(device: LifxDevice, data: { [key: string]: any }) {
		if (data.css) {
			const css = this.parseString(data.css)
			const kelvin = this.parseNumber(data.kelvin)
			if (css)
				return device.setCSS(css, kelvin)
		}
		else if (data.r != null && data.g != null && data.b != null) {
			const r = this.parseNumber(data.r)
			const g = this.parseNumber(data.g)
			const b = this.parseNumber(data.b)
			const a = this.parseNumber(data.a)
			const kelvin = this.parseNumber(data.kelvin)

			if (r != null && g != null && b != null)
				return device.setRGB(r, g, b, a, kelvin)
		}
		return null
	}

	private async respondToDeviceTemperaturePost(device: LifxDevice, data: { [key: string]: any }) {
		const color = await device.getColor()
		const kelvin = this.parseNumber(data.kelvin)
		if (color && kelvin != null)
			return device.setColor({
				...color,
				kelvin
			})
		return null
	}

	private async respondToDeviceGroupPost(device: LifxDevice, key: string, data: { [key: string]: any }) {
		const id = this.parseString(data.id)
		const label = this.parseString(data.label)
		if (id != null && label != null) {
			if (key === 'group')
				return device.setGroup(id, label)
			else
				return device.setLocation(id, label)
		}
		return null
	}

	private async respondToGroupPost(group: string) {

	}

	private async getData() {
		return new Promise((resolve: (data: qs.ParsedUrlQuery) => any, reject) => {
			const chunks: Array<string> = []
			this.request.on('data', (chunk) => {
				chunks.push(chunk)
			})
			this.request.on('end', () => {
				try {
					const data = chunks.join('')
					resolve(JSON.parse(data))
				}
				catch (error) {
					resolve({})
				}
			})
		})
	}

	private parseRequest() {
		// Parse request method
		if (! this.request.method)
			throw {}
		this.method = this.request.method.toLowerCase()

		// Parse request URL
		if (! this.request.url)
			throw {}
		const req = url.parse(this.request.url)
		if (! req.pathname)
			throw {}
		this.path = req.pathname.split('/').filter((p) => p.length > 0)

		// Parse request query
		this.query = req.query ? qs.parse(req.query) : {}
	}

	private shiftPath() {
		if (this.path.length > 0)
			return this.path.shift()
		return null
	}

	parseBoolean(value: any): boolean {
		return value === 'true'
	}

	parseNumber(value: any): number | undefined {
		const v = parseFloat(value)
		if (! isNaN(v))
			return v
	}

	parseString(value: any): string | undefined {
		if (value != null && typeof value === 'string')
			return value
	}

	isGet() {
		return this.method === 'get'
	}

	isPost() {
		return this.method === 'post'
	}

	didRespond() {
		return this.responded
	}
}
