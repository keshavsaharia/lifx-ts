export interface DeviceService {
	service?: number
	port?: number
}

export interface DeviceLabel {
	label: string
}

export interface DeviceInfo {
	time: number
	uptime: number
	downtime: number
}

export interface DevicePower {
	on: boolean
}

export interface DeviceFirmware {
	build: number
	version_minor: number
	version_major: number
}

export interface DeviceWifi {
	signal: number
	// Received Signal Strength Indicator (RSSI)
	rssi: number
}

export interface DeviceVersion {
	vendor: number
	product: number
}

export interface DeviceGroup {
	id: string
	label: string
	updated: number
}

export interface DeviceReboot {

}
