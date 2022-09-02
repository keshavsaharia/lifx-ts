import {
	Response,
	LifxDevice
} from '.'

import {
	DeviceFirmware,
	DeviceVersion,
	DeviceInfo,
	DeviceLabel,
	DeviceGroup,
	DevicePower
} from './packet/device/interface'

import {
	LightPower,
	LightColor,
	LightState,
	LightInfrared,
	HSBColor
} from './packet/light/interface'

export type ResultObject = { [key: string]: any }
export interface DeviceState {
	ip: string
	mac: string
	port: number
	alive?: boolean
	firmware?: DeviceFirmware
	version?: DeviceVersion
	info?: DeviceInfo
	label?: DeviceLabel
	group?: DeviceGroup
	location?: DeviceGroup
	power?: DevicePower
	light?: LightPower
	color?: LightState
	infrared?: LightInfrared
	product?: LifxProduct
}

export interface ClientState {
	id: number
	alive: boolean
	queue?: number
	device: Array<DeviceState>
}

export type ResponseHandler<Result> = (response: Response, payload: Result) => any
export type LifxDeviceHandler = (device: LifxDevice) => any
export type LifxStateHandler<Result> = (result: Result, device: LifxDevice) => any

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

// Export payload interfaces
export {
	DeviceFirmware,
	DeviceVersion,
	DeviceInfo,
	DeviceLabel,
	DeviceGroup,
	DevicePower,
	LightPower,
	LightColor,
	LightState,
	LightInfrared,
	HSBColor
}
