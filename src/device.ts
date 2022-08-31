import {
	LifxClient,
	Packet,
	Response,

	// Packets
	DeviceGetInfo,
	DeviceGetFirmware,
	DeviceGetVersion,
	DeviceGetLabel,
	DeviceSetLabel,

	DeviceEchoPacket,
	DeviceRebootPacket,

	DeviceGetLocation,
	DeviceSetLocation,
	DeviceGetGroup,
	DeviceSetGroup,

	DeviceGetPower,
	DeviceSetPower,
	LightSetPower,
	LightGetPower,
	LightSetColor,
	LightGetColor,
	LightSetInfrared,
	LightGetInfrared,

} from '.'

import {
	DeviceFirmware,
	DevicePower,
	DeviceVersion,
	DeviceGroup,
	DeviceLabel,
	DeviceInfo,
	LightColor,
	LightState,
	LightPower,
	LightInfrared,
	LifxProduct
} from './interface'

import {
	RGBtoHSB
} from './util'

import {
	PING_TIMEOUT,
	LIFX_PORT,
	LIFX_PRODUCT
} from './constant'

export default class LifxDevice {
	private client: LifxClient
	private ip: string
	private mac: string
	private port: number

	firmware?: DeviceFirmware
	version?: DeviceVersion
	info?: DeviceInfo
	label?: DeviceLabel
	group?: DeviceGroup
	location?: DeviceGroup
	power?: DevicePower
	lightPower?: LightPower
	color?: LightState
	infrared?: LightInfrared
	product?: LifxProduct

	constructor(client: LifxClient, ip: string, mac: string, port?: number) {
		this.client = client
		this.ip = ip
		this.mac = mac
		this.port = port || LIFX_PORT
	}

	async load() {
		await Promise.all([
			this.getFirmware(),
			this.getVersion(),
			this.getInfo(),
			this.getLabel(),
			this.getLocation(),
			this.getGroup()
		])
		this.client.emit('load', this)
		await this.update()
		return this
	}

	async update() {
		if (! this.product)
			return

		const updates: Array<Promise<any>> = [
			this.getLocation(),
			this.getGroup()
		]

		if (this.product.features.color)
			updates.push(this.getColor())
		if (this.product.features.infrared)
			updates.push(this.getInfrared())

		return Promise.all(updates)
	}

	async send(packet: Packet<any>) {
		try {
			return this.client.send(packet, this)
		}
		catch (e) {}
	}

	async get<R>(packet: Packet<R>, timeout?: number): Promise<R | undefined> {
		try {
			const result = await this.client.get(packet, this, timeout)
			return result
		}
		catch (error) {}
	}

	async getFirmware() {
		return this.firmware = await this.get(new DeviceGetFirmware())
	}

	async getVersion() {
		this.version = await this.get(new DeviceGetVersion())
		if (this.version)
			this.product = LIFX_PRODUCT[this.version.product]
		return this.version
	}

	async echo(text: string) {
		const result = await this.get(new DeviceEchoPacket(text))
		if (result)
			return result.text
	}

	async reboot() {
		await this.send(new DeviceRebootPacket())
		return this
	}

	async setRGB(r: number, g: number, b: number) {
		return this.setColor({
			...RGBtoHSB(r, g, b, 1.0),
			kelvin: this.color ? this.color.kelvin :
				((this.product && this.product.features.temperature_range) ?
					this.product.features.temperature_range[0] : 3500)
		})
	}

	async setColor(color: LightColor, duration?: number) {
		return this.color = await this.get(new LightSetColor(color, duration))
	}

	async getColor() {
		return this.color = await this.get(new LightGetColor())
	}

	async setGroup(id: string, label: string) {
		return this.group = await this.get(new DeviceSetGroup(id, label))
	}

	async getGroup() {
		return this.group = await this.get(new DeviceGetGroup())
	}

	async setLocation(id: string, label: string) {
		return this.location = await this.get(new DeviceSetLocation(id, label))
	}

	async getLocation() {
		return this.location = await this.get(new DeviceGetLocation())
	}

	async setInfrared(brightness: number) {
		return this.infrared = await this.get(new LightSetInfrared(brightness))
	}

	async getInfrared() {
		return this.infrared = await this.get(new LightGetInfrared())
	}

	async setPower(on: boolean) {
		return this.power = await this.get(new DeviceSetPower(on))
	}

	async getPower() {
		return this.power = await this.get(new DeviceGetPower())
	}

	async turnOn() {
		return this.setPower(true)
	}

	async turnOff() {
		return this.setPower(false)
	}

	async setLightPower(on: boolean, duration?: number) {
		return this.lightPower = await this.get(new LightSetPower(on, duration))
	}

	async getLightPower() {
		return this.lightPower = await this.get(new LightGetPower())
	}

	async fadeOn(duration: number) {
		return this.setLightPower(true, duration)
	}

	async fadeOff(duration: number) {
		return this.setLightPower(false, duration)
	}

	async getInfo() {
		return this.info = await this.get(new DeviceGetInfo())
	}

	async setLabel(label: string) {
		return this.label = await this.get(new DeviceSetLabel(label))
	}

	async getLabel() {
		return this.label = await this.get(new DeviceGetLabel())
	}

	async ping(timeout?: number): Promise<boolean> {
		return new Promise(async (resolve: (pong: boolean) => any) => {
			const packet = new DeviceGetInfo()

			// Timeout returns false
			let timedOut = false
			const responseTimeout = setTimeout(() => {
				timedOut = true
				resolve(false)
			}, timeout || PING_TIMEOUT)

			packet.onResponse(() => {
				if (! timedOut) {
					clearTimeout(responseTimeout)
					resolve(true)
				}
			})

			await this.send(packet)
		})

	}

	didRespond(response: Response) {
		return this.ip == response.ip && this.mac == response.mac
	}

	getIP() {
		return this.ip
	}

	getMacAddress() {
		return this.mac
	}

	getPort() {
		return this.port
	}

	toString() {
		// TODO
		return 'IP: ' + this.getIP()
	}
}
