import {
	LifxClient,
	LifxDevice,
	DeviceSetPower
} from '..'

import {
	UIElement,
	UIHomeView,
	UIDeviceView,
	UIErrorView
} from './ui'

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
			'Content-Type': 'text/html'
		})
		this.response.end(element.render())
		return this
	}

	private json(data: any): Request {
		this.responded = true
		this.response.writeHead(200, {
			'Content-Type': 'application/json'
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

	private async respondToGet() {
		const resource = this.shiftPath()

		if (! resource) {
			return this.render(new UIHomeView(this.client.getState()))
		}
		else if (resource === 'device') {
			const deviceId = this.shiftPath()

			if (! deviceId) {
				// list devices
			}
			else if (this.client.hasDevice(deviceId)) {
				const device = this.client.getDevice(deviceId)
				return this.render(new UIDeviceView(this.client.getState(), device.getState()))
			}
			else {
				// device not found
			}
		}
		else if (resource === 'group' || resource === 'location') {
			const groupId = this.shiftPath()

			if (! groupId) {
				// show group list
			}
			else {
				const devices = (resource === 'group') ?
					this.client.getGroup(groupId) : this.client.getLocation(groupId)
				// show group/location view
			}
		}
		else return this.render(new UIErrorView(this.client.getState()))
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
	}

	private async respondToDevicePost(device: LifxDevice, key: string, data: { [key: string]: any }) {
		let result: any = null
		console.log('post', data)
		if (key === 'power') {
			result = await device.setPower(data.on === 'true')
		}
		if (result && this.query.json)
			return this.json(result)
		else
			return this.redirect('/device/' + device.getMacAddress())
	}

	private async getData() {
		return new Promise((resolve: (data: qs.ParsedUrlQuery) => any, reject) => {
			const chunks: Array<string> = []
			this.request.on('data', (chunk) => {
				chunks.push(chunk)
			})
			this.request.on('end', () => {
				try {
					resolve(qs.parse(chunks.join('')))
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

	isGet() {
		return this.method === 'get'
	}

	isPost() {
		return this.method === 'post'
	}

	didRespond() {
		return true
	}
}
