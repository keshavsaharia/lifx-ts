import http from 'http'

import {
	LifxClient
} from '../..'

import {
	Request,
	Response,
	Router,
	RequestClass,
	RequestInstance,
	WebsocketMessage
} from '../interface'

import {
	fromHTTPRequest,
	fromWebsocket,
	toHTTPResponse,
	endHTTPResponse,
	toWebsocketMessage,
	routeMatch,
	shiftRoute
} from './util'

import {
	InvalidParameter,
	InvalidRouter,
	InvalidRoute
} from '../error'

export default class LifxRouter<Param> implements RequestInstance<Param> {
	client: LifxClient
	schema: Router<Param>

	constructor(client: LifxClient) {
		this.client = client
	}

	define(schema: Router<Param>) {
		this.schema = schema
	}

	parameter(id: string): Param {
		throw InvalidParameter
	}

	async routeHTTP(req: http.IncomingMessage, res: http.ServerResponse): Promise<Response> {
		try {
			const request = await fromHTTPRequest(req)
			const response = await this.respond(request)
			await toHTTPResponse(response, res)
			return response
		}
		// Error handler if there was an error passed above the top-level router handler
		catch (error) {
			console.log('http error', error)
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

	async routeWebsocket(message: WebsocketMessage): Promise<WebsocketMessage> {
		const request = fromWebsocket(message)
		const response = await this.respond(request)
		return toWebsocketMessage(request, response)
	}

	async respond(request: Request, param?: Param): Promise<Response> {
		if (! this.schema)
			throw InvalidRouter

		return this.route(request, param).catch((error) => {
			if (this.schema.Error)
				return this.execute(this.schema.Error, request, param)
			throw error
		})
	}

	private async route(request: Request, param?: Param): Promise<Response> {
		// Remove the first part of the path
		const token = shiftRoute(request)

		// If there were no tokens in the stream (e.g. path is at /)
		if (! token) {
			// If there is a standard configured request handler
			if (this.schema.Request)
				return this.execute(this.schema.Request, request, param, this.schema.Error)
			else if (this.schema.Error)
				return this.execute(this.schema.Error, request, param)
		}

		// If this is the end of the path and this router accepts the final token as a parameter ID
		else if (request.token.length == 0 && this.schema.ParamRequest)
			return this.execute(this.schema.ParamRequest, request, this.parameter(token), this.schema.Error)

		// Iterate over all possible child routes in order
		else if (this.schema.route) {
			for (let i = 0 ; i < this.schema.route.length ; i++) {
				const child = this.schema.route[i]

				// If this is a parametrized route (i.e. token is an ID of the parameter value,
				// then next token is matched against the path)
				if (child.param && routeMatch(child, request.token[0])) {
					const param = this.parameter(token)
					shiftRoute(request)
					return this.execute(child.Request, request, param, child.Error)
				}

				// If the path matches this route, pass the request to a child request or router instance.
				else if (! child.param && routeMatch(child, token)) {
					return this.execute(child.Request, request, param, child.Error)
				}
			}
		}

		// If there was no matching route, throw an invalid route error to the nearest error handler
		throw {
			...InvalidRoute,
			...request
		}
	}

	private async execute<R>(
			requestHandler: RequestClass<R>,
			request: Request, requestParam?: R,
			errorHandler?: RequestClass<any>
		): Promise<Response> {
		// Create a request handler with the optional parameter
		return new requestHandler(this.client)
			.respond(request, requestParam)
			.catch((error) => {
				if (errorHandler)
					return new errorHandler(this.client).respond(request, requestParam)
				throw error
			})
	}

}
