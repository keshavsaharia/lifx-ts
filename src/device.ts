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
	LifxProduct,
	LifxDeviceHandler
} from './interface'

import {
	RGBtoHSB,
	objectEqual
} from './util'

import {
	PING_TIMEOUT,
	DEFAULT_INTERVAL,
	LIFX_PORT,
	LIFX_PRODUCT,
	LIFX_STATE_KEYS
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
	light?: LightPower
	color?: LightState
	infrared?: LightInfrared
	product?: LifxProduct

	// Event handlers and state watchers
	handler: { [event: string]: Array<LifxDeviceHandler> }
	watcher: { [key: string]: NodeJS.Timer }
	updated: { [key: string]: number }
	timeout: number = 0

	// Caches a JSON representation of the device state, so updates
	// are triggered when any part of this object changes
	state: { [key: string]: any }

	/**
	 * @constructor
	 */
	constructor(client: LifxClient, ip: string, mac: string, port?: number) {
		this.client = client
		this.ip = ip
		this.mac = mac
		this.port = port || LIFX_PORT
		this.handler = {}
		this.watcher = {}
		this.updated = {}
		this.state = this.getState()
	}

	/**
	 * @func 	load
	 * @desc 	Load the device state
	 */
	async load() {
		const [ firmware, version, power, label, info ] = await Promise.all([
			this.get(new DeviceGetFirmware()),
			this.get(new DeviceGetVersion()),
			this.get(new DeviceGetPower()),
			this.get(new DeviceGetLabel()),
			this.get(new DeviceGetInfo())
		])

		this.firmware = firmware
		this.version = version
		this.power = power
		this.label = label
		this.info = info

		const [ group, location ] = await Promise.all([
			this.get(new DeviceGetGroup()),
			this.get(new DeviceGetLocation())
		])

		this.group = group
		this.location = location

		// Load the product features
		if (version)
			this.product = LIFX_PRODUCT[version.product]

		if (this.product) {
			if (this.product.features.color)
				this.color = await this.get(new LightGetColor())
			if (this.product.features.infrared)
				this.infrared = await this.get(new LightGetInfrared())
		}
		this.cacheState()
		this.client.emit('load', this)
		return this
	}

	remove() {
		return this.client.removeDevice(this)
	}

	stop() {
		this.stopAllWatchers()
	}

	onChange(handler: LifxDeviceHandler) {
		return this.on('change', handler)
	}

	async send(packet: Packet<any>) {
		try {
			return this.client.send(packet, this)
		}
		catch (e) {}
	}

	async get<R>(packet: Packet<R>, timeout?: number): Promise<R | undefined> {
		try {
			return await this.client.get(packet, this, timeout)
		}
		catch (error) {
			if (error.code === 'device_timeout')
				this.remove()
			throw error
		}
	}

	async getFirmware() {
		return this.reactiveGet('firmware', async () => this.get(new DeviceGetFirmware()))
	}

	async getVersion() {
		await this.reactiveGet('version', async () => await this.get(new DeviceGetVersion()))

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

	async setRGB(r: number, g: number, b: number, a?: number) {
		return this.setColor({
			...RGBtoHSB(r, g, b, a),
			kelvin: this.color ? this.color.kelvin :
				((this.product && this.product.temperature) ? this.product.temperature.min : 3500)
		})
	}

	async setColor(color: LightColor, duration?: number) {
		return this.reactiveGet('color', () => this.get(new LightSetColor(color, duration)))
	}

	async getColor() {
		return this.reactiveGet('color', () => this.get(new LightGetColor()))
	}

	async setTemperature(kelvin: number) {
		if (! this.product || ! this.product.temperature)
			return

		const temperature = this.product.temperature
		kelvin = Math.max(temperature.min, Math.min(kelvin, temperature.max))
		const color = await this.getColor()
		if (color) {
			await this.setColor({
				...color,
				kelvin
			})
		}
	}

	async setGroup(id: string, label: string) {
		return this.reactiveGet('group', () => this.get(new DeviceSetGroup(id, label)))
	}

	async getGroup() {
		return this.reactiveGet('group', () => this.get(new DeviceGetGroup()))
	}

	onGroup(handler: LifxDeviceHandler) {
		return this.on('group', handler)
	}

	watchGroup(interval?: number) {
		return this.watch('group', interval || DEFAULT_INTERVAL)
	}

	async setLocation(id: string, label: string) {
		return this.reactiveGet('location', () => this.get(new DeviceSetLocation(id, label)))
	}

	async getLocation() {
		return this.reactiveGet('location', () => this.get(new DeviceGetLocation()))
	}

	onLocation(handler: LifxDeviceHandler) {
		return this.on('location', handler)
	}

	watchLocation(interval?: number) {
		return this.watch('location', interval || DEFAULT_INTERVAL)
	}

	async setInfrared(brightness: number) {
		return this.reactiveGet('infrared', () => this.get(new LightSetInfrared(brightness)))
	}

	async getInfrared() {
		return this.reactiveGet('infrared', () => this.get(new LightGetInfrared()))
	}

	onInfrared(handler: LifxDeviceHandler) {
		return this.on('infrared', handler)
	}

	watchInfrared(interval?: number) {
		return this.watch('infrared', interval || DEFAULT_INTERVAL)
	}

	async setPower(on: boolean) {
		return this.reactiveGet('power', () => this.get(new DeviceSetPower(on)))
	}

	async getPower() {
		return this.reactiveGet('power', () => this.get(new DeviceGetPower()))
	}

	onPower(handler: LifxDeviceHandler) {
		return this.on('power', handler)
	}

	watchPower(interval?: number) {
		return this.watch('power', interval || DEFAULT_INTERVAL)
	}

	async turnOn() {
		return this.setPower(true)
	}

	async turnOff() {
		return this.setPower(false)
	}

	async setLight(on: boolean, duration?: number) {
		return this.reactiveGet('light', () => this.get(new LightSetPower(on, duration)))
	}

	async getLight() {
		return this.reactiveGet('light', () => this.get(new LightGetPower()))
	}

	onLight(handler: LifxDeviceHandler) {
		return this.on('light', handler)
	}

	watchLight(interval?: number) {
		return this.watch('light', interval || DEFAULT_INTERVAL)
	}

	async fadeOn(duration: number) {
		return this.setLight(true, duration)
	}

	async fadeOff(duration: number) {
		return this.setLight(false, duration)
	}

	async getInfo() {
		return this.reactiveGet('info', () => this.get(new DeviceGetInfo()))
	}

	onInfo(handler: LifxDeviceHandler) {
		return this.on('info', handler)
	}

	watchInfo(interval?: number) {
		return this.watch('info', interval || DEFAULT_INTERVAL)
	}

	async setLabel(label: string) {
		return this.reactiveGet('label', () => this.get(new DeviceSetLabel(label)))
	}

	async getLabel() {
		return this.reactiveGet('label', () => this.get(new DeviceGetLabel()))
	}

	onLabel(handler: LifxDeviceHandler) {
		return this.on('label', handler)
	}

	watchLabel(interval?: number) {
		return this.watch('label', interval || DEFAULT_INTERVAL)
	}

	async ping(timeout?: number): Promise<string | null> {
		try {
			this.info = await this.get(new DeviceGetInfo(), timeout || PING_TIMEOUT)
			return this.mac
		}
		catch (error) {
			return null
		}
	}

	/**
	 * @func 	didRespond
	 * @desc 	Validate the given Response instance was produced by this device.
	 */
	didRespond(response: Response) {
		return this.ip == response.ip && this.mac == response.mac
	}

	/**
	 * @func 	getIP
	 * @desc 	Return the IP address of this device.
	 */
	getIP() {
		return this.ip
	}

	/**
	 * @func 	getMacAddress
	 * @desc 	Return the unique MAC address of this device.
	 */
	getMacAddress() {
		return this.mac
	}

	/**
	 * @func 	getPort
	 * @desc 	Return the UDP port this device is listening on
	 */
	getPort() {
		return this.port
	}


	getTemperatureRange(): Array<number> | undefined {
		if (this.product)
			return this.product.features.temperature_range
	}

	getMinTemperature(): number {
		if (this.product && this.product.features.temperature_range)
			return this.product.features.temperature_range[0]
		return 2700
	}

	getMaxTemperature(): number {
		if (this.product && this.product.features.temperature_range)
			return this.product.features.temperature_range[1]
		return 2700
	}

	on(event: string, handler: LifxDeviceHandler) {
		if (! this.handler[event])
			this.handler[event] = []
		this.handler[event].push(handler)
		return this
	}

	off(event: string) {
		delete this.handler[event]
		return this
	}

	/**
	 * @func 	watch
	 * @desc 	Send periodic requests to the device for the latest state
	 */
	watch(key: string, interval: number) {
		let update: (() => any) | undefined

		if (key === 'power') update = () => this.getPower()
		else if (key === 'light') update = () => this.getLight()
		else if (key === 'color') update = () => this.getColor()
		else if (key === 'infrared') update = () => this.getInfrared()
		else if (key === 'group') update = () => this.getGroup()
		else if (key === 'location') update = () => this.getLocation()
		else if (key === 'label') update = () => this.getLabel()
		else if (key === 'info') update = () => this.getInfo()

		if (update)
			return this.addWatcher(key, interval, update.bind(this))
		return this
	}

	private addWatcher(key: string, interval: number, update: () => Promise<any>) {
		this.stopWatcher(key)
		this.watcher[key] = setInterval(() => {
			update()
		}, interval)

		return this
	}

	private stopWatcher(key: string) {
		if (this.watcher[key])
			clearInterval(this.watcher[key])
		return this
	}

	private stopAllWatchers() {
		Object.keys(this.watcher).forEach((key) => {
			clearInterval(this.watcher[key])
		})
		this.watcher = {}
	}

	emit(event: string) {
		if (this.handler[event])
			this.handler[event].forEach((handler) => handler(this))
	}

	getState(): { [key: string]: any } {
		const device: { [key: string]: any } = this
		const state: { [key: string]: any } = {
			ip: this.ip,
			mac: this.mac,
			port: this.port,
			product: this.product
		}
		LIFX_STATE_KEYS.forEach((key) => {
			if (device[key])
				state[key] = device[key]
		})
		return state
	}

	private async reactiveGet<Result>(key: string, source: () => Promise<Result>): Promise<Result> {
		const device: { [key: string]: any } = this
		try {
			const result = await source.bind(this)()

			if (result != null && ! objectEqual(device[key], result)) {
				device[key] = result
				this.state[key] = result
				this.emit('change')
				this.emit(key)
				this.client.emit('change', this)
				this.client.emit('change_' + key, this)
			}
			return result
		}
		catch (error) {
			if (device[key])
				return device[key]
			if (error.code === 'device_timeout')
				this.timeout++
			throw error
		}
	}

	private cacheState() {
		this.state = this.getState()
		return this
	}

	getDeviceLabel(): string {
		if (this.label)
			return this.label.label
		return ''
	}

	isOn(): boolean {
		if (this.power)
			return this.power.on
		if (this.light)
			return this.light.level > 0
		return false
	}

	isOff(): boolean {
		return ! this.isOn()
	}

	inGroup(group: DeviceGroup | string): boolean {
		if (this.group == null)
			return false
		return this.group.id === ((typeof group === 'string') ? group : group.id)
	}

	inLocation(location: DeviceGroup | string): boolean {
		if (this.location == null)
			return false
		return this.location.id === ((typeof location === 'string') ? location : location.id)
	}

	toString() {
		return JSON.stringify(this.getState(), null, 4)
	}
}
