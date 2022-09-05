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

export function routeMatch(route: Route<any>, path?: string): boolean {
	if (route.path == null || path == null)
		return false
	if (route.regex)
		return path.match(new RegExp(route.path, route.caseSensitive ? '' : 'i')) != null
	else
		return route.path === path
}

export function shiftRoute(request: Request) {
	const first = request.token.splice(0, 1)[0]
	if (first)
		request.route.push(first)
	return first
}

function tokenizeURL(url: string): Array<string> {
	if (url == null) return []
	return url.split('/').filter((p) => p.length > 0)
}

export function fromWebsocket(message: WebsocketMessage): Request {
	return {
		method: message.method,
		url: message.url,
		token: tokenizeURL(message.url),
		route: [],
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
	const requestUrl = target.pathname
	if (! requestUrl)
		throw InvalidRequest

	// Parse path name and query parameters
	const token = tokenizeURL(requestUrl)
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
		url: requestUrl,
		token,
		route: [],
		data,
		// Query object parsed to only strings
		query: query as { [key: string]: string }
	}
}

export async function toHTTPResponse(response: Response, res: http.ServerResponse) {
	let status = response.status || 200
	const headers = {
		'Server': 'Lifx Server',
		'Cache-Control': 'no-store'
	} as { [key: string]: string }
	if (response.redirect) {
		status = 301
		headers['Location'] = response.redirect
	}
	if (response.json != null) {
		headers['Content-Type'] = 'application/json'
		response.body = JSON.stringify(response.json)
	}
	if (response.type) {
		headers['Content-Type'] = response.type
	}
	if (response.close !== false) {
		headers['Connection'] = 'close'
	}

	return new Promise((resolve: (response: Response) => any) => {
		res.writeHead(status, headers)
		res.end(response.body, () => {
			resolve(response)
		})
	})

}

export function endHTTPResponse(res: http.ServerResponse, status?: number) {
	res.writeHead(status || 500).end()
}

export function toWebsocketMessage(request: Request, response: Response): WebsocketMessage {
	return {
		method: request.method,
		url: request.url,
		data: response.json || {}
	}
}

export function getBoolean(key: string, data?: { [key: string]: any }): boolean {
	if (! data)
		return false
	return data[key] === true || data[key] === 'true'
}

export function getNumber(key: string, data?: { [key: string]: any }): number | undefined {
	if (! data || data[key] == null)
		return undefined
	const value = parseFloat(data[key])
	if (! isNaN(value))
		return value
}

export function getString(key: string, data?: { [key: string]: any }): string | undefined {
	return (data && data[key] != null && typeof data[key] === 'string') ? data[key] : undefined
}
