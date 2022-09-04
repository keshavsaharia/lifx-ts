import http from 'http'
import url from 'url'
import qs from 'querystring'

import {
	Request,
	Response,
	RequestData,
	Route
} from './interface'

import {
	WebsocketMessage
} from '../interface'

import {
	InvalidRequest
} from '../error'

export function routeMatch(route: Route, path: string) {
	if (route.path == null)
		return false
	if (route.regex)
		return new RegExp(route.path, route.caseSensitive ? '' : 'i')
	else
		return route.path === path
}

export function fromWebsocket(message: WebsocketMessage): Request {
	const path = message.url.split('/').filter((p) => p.length > 0)

	return {
		method: message.method,
		path,
		query: {},
		data: message.data,
		json: true
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

export async function toHTTPResponse(response: Response, res: http.ServerResponse) {
	let status = response.status || 200
	const headers = {
		'Server': 'Lifx Server'
		// TODO: CORS
	} as { [key: string]: string }
	if (response.redirect) {
		status = 301
		headers['Location'] = response.redirect
	}
	if (response.type) {
		headers['Content-Type'] = response.type
	}
	if (response.close) {
		headers['Connection'] = 'close'
	}

	return new Promise((resolve: (response: Response) => any) => {
		res.writeHead(status, headers)
		res.end(response.json ? JSON.stringify(response.json) : response.body, () => {
			resolve(response)
		})
	})

}

export function endHTTPResponse(res: http.ServerResponse, status?: number) {
	res.writeHead(status || 500).end()
}
