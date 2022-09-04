import http from 'http'

import LifxRequest from './request'

import {
	Request,
	Response,
	Router,
	WebsocketMessage
} from '../interface'

import {
	fromHTTPRequest,
	fromWebsocket
} from './util'

export default class LifxRouter {

	constructor() {

	}

	async routeRequest(req: http.IncomingMessage, res: http.ServerResponse) {
		try {
			const request = await fromHTTPRequest(req)
			const response = await this.route(request)
		}
		catch (error) {
			res.writeHead(error.status || 500, error.message).end()
		}
	}

	async routeMessage(message: WebsocketMessage) {
		const request = fromWebsocket(message)
	}

	private async route(request: Request): Promise<Response> {
		return {
			type: 'text',

		}
	}
}
