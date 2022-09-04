import http from 'http'

import {
	LifxClient
} from '../..'

import {
	Websocket
} from '..'

import {
	Request,
	Response,
	Router,
	RequestClass,
	WebsocketMessage,
	isRouterRoute
} from '../interface'

import {
	fromHTTPRequest,
	fromWebsocket,
	toHTTPResponse,
	endHTTPResponse,
	routeMatch
} from './util'

import {
	InvalidRoute,
	InternalRouter
} from '../error'

export default class LifxRouter<Param> {
	client: LifxClient
	schema: Router<Param>

	constructor(client: LifxClient, schema: Router<Param>) {
		this.client = client
		this.schema = schema
	}

	async routeHTTP(req: http.IncomingMessage, res: http.ServerResponse): Promise<Response> {
		try {
			const request = await fromHTTPRequest(req)
			const response = await this.routeRequest(request)
			await toHTTPResponse(response, res)
			return response
		}
		// Error handler if there was an error passed above the top-level router handler
		catch (error) {
			const response = {
				status: error.status || 500,
				body: error
			}
			try {
				await toHTTPResponse(response, res)
				return response
			}
			catch (error) {
				endHTTPResponse(res, 500)
				return response
			}
		}
	}

	async routeWebsocket(message: WebsocketMessage, socket: Websocket): Promise<Response> {
		try {
			const request = fromWebsocket(message)
			const response = await this.routeRequest(request)
			return response
		}
		catch (error) {
			return {
				status: error.status || 500,
				body: error
			}
		}
	}

	private async route(request: Request): Promise<Response> {
		const response = await this.routeRequest(request).catch((error) => {

			throw error
		})

		return response
	}

	private async routeRequest(request: Request): Promise<Response> {
		// Remove the first part of the path
		const first = request.path.splice(0, 1)[0]
		const isLast = (request.path.length == 0)

		// If there is a configured error handler, add a catch statement to
		// returned promises to trigger the handler on request failure
		const handleError: (promise: Promise<Response>) => Promise<Response> =
			this.schema.ErrorHandler ?
				(p) => p.catch((error) => {
					request.error = error
					return new this.schema.ErrorHandler!(this.client, request).respond(request)
				}) : (p) => p;	// otherwise identity function

		// If this is the end of the path
		if (! first && this.schema.Request)
			return new this.schema.Request(this.client, request).respond(request)

		// If this is a parametrized request
		else if (isLast && (this.schema.ParamRouter || this.schema.ParamRequest)) {
			if (! this.schema.param)
				throw InternalRouter

			const param = this.schema.param(first)
			if (this.schema.ParamRouter)
				return new this.schema.ParamRouter(this.client, param).route(request)
			else if (this.schema.ParamRequest)
				return new this.schema.ParamRequest(this.client, request).respond(request)
		}

		// Iterate over all child routes in order
		else if (this.schema.route) {
			for (let i = 0 ; i < this.schema.route.length ; i++) {
				const child = this.schema.route[i]

				// If the path matches a route, execute the child router
				if (routeMatch(child, first)) {
					if (isRouterRoute(child))
						return handleError(new child.Router(this.client).routeRequest(request))
					else
						return handleError(new child.Request(this.client, request).respond(request))
				}
			}
		}

		// If there was no matching route, try to render the error handler, otherwise
		// throw an error
		if (this.schema.ErrorHandler) {
			request.error = InvalidRoute
			const error = new this.schema.ErrorHandler(this.client, request)
			return error.respond(request)
		}
		else throw InvalidRoute
	}




}
