import http from 'http'
import url from 'url'
import qs from 'querystring'

import {
	Request,
	Response,
	RequestData
} from './interface'

import {
	WebsocketMessage
} from '../interface'

import {
	InvalidRequest
} from '../error'

export function fromWebsocket(message: WebsocketMessage): Request {
	const path = message.url.split('/').filter((p) => p.length > 0)

	return {
		method: message.method,
		path,
		query: {},
		data: message.data
	}
}

export async function fromHTTPRequest(request: http.IncomingMessage): Promise<Request> {
	// Parse request method
	if (! request.method || ! request.url)
		throw InvalidRequest
	const method = request.method.toLowerCase()

	const target = url.parse(request.url)
	if (! target.pathname)
		throw InvalidRequest

	// Parse path name and query parameters
	const path = target.pathname.split('/').filter((p) => p.length > 0)
	const query = target.query ? qs.parse(target.query) : {}
	Object.keys(query).forEach((k) => {
		if (Array.isArray(query[k]))
			query[k] = query[k]![0]
		else if (query[k] == null)
			delete query[k]
	})

	// Parse request body into JSON object
	let data: RequestData | undefined
	if (method == 'post') {
		data = await new Promise((resolve: (data: RequestData) => any) => {
			const chunks: Array<string> = []
			request.on('data', (chunk) => {
				chunks.push(chunk)
			})
			request.on('end', () => {
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

	return {
		method,
		path,
		data,
		// Query object parsed to only strings
		query: query as { [key: string]: string }
	}
}

export function sendHTTPResponse(response: Response, res: http.ServerResponse) {
	let status = response.status || 200
	const headers = {} as { [key: string]: string }
	if (response.redirect) {
		status = 301
		headers['Location'] = response.redirect
	}
	if (response.type) {
		headers['Content-Type'] = response.type
	}
	if (response.close !== false) {
		headers['Connection'] = 'close'
	}

	res.writeHead(200, {
		'Connection': 'close',
		...headers
	})
	this.response.end(response.body)
}
