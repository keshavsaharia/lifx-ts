export type RequestData = { [key: string]: any }
export type ResponseHandler = () => any

export interface WebsocketMessage {
	method: 'get' | 'post'
	url: string
	data: RequestData
}

export function isWebsocketMessage(message: any): message is WebsocketMessage {
	return isObject(message) &&
		   isString(message.url) &&
		   isObject(message.data) &&
		   (message.method === 'get' || message.method === 'post')
}

export function isObject(obj: any): obj is RequestData {
	return obj != null && typeof obj === 'object'
}

export function isString(str: any): str is string {
	return str != null && typeof str === 'string'
}
