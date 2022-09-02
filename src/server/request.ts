import {
	LifxClient
} from '..'

import {
	UIElement,
	UIHomeView,
	UIErrorView
} from './ui'

import http from 'http'
import url from 'url'
import qs from 'querystring'

export default class Request {
	client: LifxClient
	request: http.IncomingMessage
	response: http.ServerResponse

	method: string
	path: Array<string>
	query: qs.ParsedUrlQuery
	json?: boolean

	constructor(client: LifxClient, request: http.IncomingMessage, response: http.ServerResponse) {
		this.client = client
		this.request = request
		this.response = response
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

	private async respondWith(element: UIElement) {
		this.response.writeHead(200, {
			'Content-Type': 'text/html'
		})
		this.response.end(element.render())
	}

	private async respondToGet() {
		const resource = this.shiftPath()

		if (! resource) {
			return this.respondWith(new UIHomeView(this.client.getState()))
		}
		else if (resource === 'device') {
			const deviceId = this.shiftPath()

			if (! deviceId) {
				// list devices
			}
			else if (this.client.hasDevice(deviceId)) {
				// show device
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
		else return this.respondWith(new UIErrorView(this.client.getState()))
	}

	private async respondToPost() {

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
		return false
	}
}
