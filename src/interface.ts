import {
	Response,
	LifxDevice
} from '.'

export type ResultObject = { [key: string]: any }

export type ResponseHandler<Result> = (response: Response, payload: Result) => any
export type LifxDeviceHandler = (device: LifxDevice) => any

export interface LifxVendor {
	vid: number
	name: string
	products: Array<LifxProduct>
}

export interface LifxProduct {
	pid: number
	name: string
	temperature?: {
		min: number
		max: number
	}
	features: {
		hev?: boolean
		color?: boolean
		chain?: boolean
		matrix?: boolean
		relays?: boolean
		buttons?: boolean
		infrared?: boolean
		multizone?: boolean
		temperature_range?: Array<number>
		extended_multizone?: boolean
	}
	upgrades?: Array<{
		major: number
		minor: number
		features: {
			extended_multizone?: boolean
			temperature_range?: Array<number>
		}
	}>
}

export interface LifxNetworkInterface {
	address: string
	netmask: string
	// Masked broadcast IPv4 address
	broadcast: string
	// MAC address
	mac: string
	// CIDR block
	cidr: string | null
}

export interface Transmission {
	source: number
	sequence: number
	buffer: Buffer
	target: string
}

export * from './packet/device/interface'
export  * from './packet/light/interface'
