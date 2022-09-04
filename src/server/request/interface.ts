import LifxRouter from './router'
import LifxRequest from './request'

export type RequestData = { [key: string]: any }

export type RequestQuery = { [key: string]: string }

export interface Request {
	method: string
	path: Array<string>
	query: RequestQuery
	data?: RequestData
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
}

export type RouterClass<R extends LifxRouter> = { new(): R }
export type RequestClass<R extends LifxRequest> = { new(): R }

export interface Router<R extends LifxRequest> {
	path?: string

	// Default route if not found
	request?: RequestClass<R>

	// Error route
	error?: RequestClass<any>

	// Child routers
	router?: Array<Router<any>>

	// Routes
	route?: Array<Route<any>>
}

export interface Route<R extends LifxRequest> {
	// Route path name or descriptor
	path?: string
	regex?: boolean

	// Whether this is a parameter route
	param?: boolean

	request: RequestClass<R>
}
