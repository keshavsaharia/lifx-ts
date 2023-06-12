import {
	LifxClient
} from '../..'

export type RequestData = { [key: string]: any }
export type RequestQuery = { [key: string]: string }

export interface Request {
	method: string
	url: string
	token: Array<string>
	route: Array<string>
	query: RequestQuery
	data?: RequestData
	// Whether to return JSON
	json?: boolean
	error?: any
}

export interface Response {
	// Content-Type header
	type?: string
	// HTTP status code
	status?: number
	// Response body
	body?: string | Buffer
	// Response json
	json?: RequestData
	// Redirect location
	redirect?: string
	// Close connection
	close?: boolean
	// Error
	error?: any
}

export type RequestClass<Param> = {
	new(client: LifxClient): RequestInstance<Param>
}

export interface RequestInstance<Param> {
	respond(request: Request, param?: Param): Promise<Response>
	parameter(param: string): Param
}

export type RouteParam<Param> = (id: string) => Param | undefined

export interface Router<Param> {
	// Default route if not found
	Request?: RequestClass<Param>

	// If there is only one token left in the path
	ParamRequest?: RequestClass<Param>

	// Error route
	Error?: RequestClass<any>

	// Routes
	route?: Array<Route<any>>
}

export interface Route<Param> {
	// Route path name or descriptor
	path?: string
	regex?: boolean
	caseSensitive?: boolean

	// Whether to parametrize the router/request class
	param?: boolean

	// Error route
	Request: RequestClass<Param>
	Error?: RequestClass<any>
}
