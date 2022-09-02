import {
	LifxClient,
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
	json?: boolean

	constructor(client: LifxClient, request: http.IncomingMessage, response: http.ServerResponse) {
		this.client = client
		this.request = request
		this.response = response
		this.responded = false
	}

	async respond() {
		this.parseMethod()
		this.parseUrl()
		this.parseQuery()

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

	private redirect(redirect: string) {
		this.responded = true
		this.response.writeHead(302, {
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

			if (deviceId) {
				const device = this.client.getDevice(deviceId)
				const deviceKey = this.shiftPath()
				console.log('data', data)

				if (device && deviceKey) {
					if (deviceKey === 'power') {
						await device.setPower(data.on === 'on')
						console.log(device.power)
					}

					return this.redirect('/device/' + deviceId)
				}
				else throw {}
			}
			else throw {}
		}
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

	private parseMethod() {
		if (! this.request.method)
			throw {}
		this.method = this.request.method.toLowerCase()
	}

	private parseUrl() {
		if (! this.request.url)
			throw {}

		const req = url.parse(this.request.url)
		if (! req.pathname)
			throw {}
		this.path = req.pathname.split('/').filter((p) => p.length > 0)
	}

	private parseQuery() {
		if (! this.request.url)
			throw {}
		this.query = qs.parse(this.request.url)

		if (this.query.json !== 'false')
			this.json = true
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
