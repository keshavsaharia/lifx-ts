export interface WebsocketMessage {
	method: string
	url: string
	data: { [key: string]: any }
}

export * from './request/interface'
