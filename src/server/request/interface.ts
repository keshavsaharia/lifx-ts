import {
	LifxClient
} from '../..'

import LifxRouter from './router'
import LifxRequest from './request'

export type RequestData = { [key: string]: any }
export type RequestQuery = { [key: string]: string }

export interface Request {
	method: string
	path: Array<string>
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
}

export type RouterClass<Param> = {
	new(client: LifxClient, param?: Param): LifxRouter<Param>
}
export type RequestClass<Param> = {
	new(client: LifxClient, request: Request, param?: Param): LifxRequest<Param>
}

export interface Router<Param> {
	// If there is only one token left in the path
	ParamRequest?: RequestClass<Param>
	ParamRouter?: RouterClass<Param>
	param?: (id: string) => Param | undefined

	// Default route if not found
	Request?: RequestClass<any>

	// Error route
	ErrorHandler?: RequestClass<any>

	// Routes
	route?: Array<RequestRoute | RouterRoute>
}

export interface Route {
	// Route path name or descriptor
	path?: string
	regex?: boolean
	caseSensitive?: boolean

	// Whether this is a parameter route
	param?: string
}

export function isRouterRoute(route: Route): route is RouterRoute {
	return route.hasOwnProperty('router')
}

export interface RouterRoute extends Route {
	Router: RouterClass<any>
}

export function isRequestRoute(route: Route): route is RequestRoute {
	return route.hasOwnProperty('request')
}

export interface RequestRoute extends Route {
	Request: RequestClass<any>
}
