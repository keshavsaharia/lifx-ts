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
	MIN_UPDATE_INTERVAL,
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

	// Caches a JSON representation of the device state, so updates
	// are triggered when any part of this object changes
	state: { [key: string]: any }

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

	async load() {
		const [ firmware, version, power, label ] = await Promise.all([
			this.get(new DeviceGetFirmware()),
			this.get(new DeviceGetVersion()),
			this.get(new DeviceGetPower()),
			this.get(new DeviceGetLabel())
		])

		this.firmware = firmware
		this.version = version
		this.power = power
		this.label = label

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

		this.client.emit('load', this)
		return this
	}

	async updateLight() {
		await this.emitOnChange(async () => {
			if (! this.product)
				return

			if (this.product.features.color)
				this.color = await this.get(new LightGetColor())
			if (this.product.features.infrared)
				this.infrared = await this.get(new LightGetInfrared())

			return this.product
		}, this.product)
	}

	stop() {
		this.stopAllWatchers()
	}

	onChange(handler: LifxDeviceHandler) {
		return this.on('change', handler)
	}

	async updateGroup() {
		return Promise.all([
			this.getLocation(),
			this.getGroup()
		])
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
		return this.reactiveGet('firmware', async () => (this.firmware = await this.get(new DeviceGetFirmware())))
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
				((this.product && this.product.features.temperature_range) ?
					this.product.features.temperature_range[0] : 3500)
		})
	}

	async setColor(color: LightColor, duration?: number) {
		return this.emitOnChange(async () =>
			(this.color = await this.get(new LightSetColor(color, duration))), this.color)
	}

	async getColor() {
		return this.color = await this.get(new LightGetColor())
	}

	async setTemperature(kelvin: number) {
		if (! this.product)
			return

		const range = this.getTemperatureRange()
		if (range) {
			kelvin = Math.max(range[0], Math.min(kelvin, range[1]))
			const color = await this.getColor()
			if (color) {
				await this.setColor({
					...color,
					kelvin
				})
			}
		}
	}

	async setGroup(id: string, label: string) {
		return this.emitOnChange(async () =>
			(this.group = await this.get(new DeviceSetGroup(id, label))), this.group)
	}

	async getGroup() {
		return this.emitOnChange(async () =>
			(this.group = await this.get(new DeviceGetGroup())), this.group)
	}

	onGroup(handler: LifxDeviceHandler) {
		return this.on('group', handler)
	}

	async setLocation(id: string, label: string) {
		return this.emitOnChange(async () =>
			(this.location = await this.get(new DeviceSetLocation(id, label))), this.location)
	}

	async getLocation() {
		return this.emitOnChange(async () =>
			(this.location = await this.get(new DeviceGetLocation())), this.location)
	}

	onLocation(handler: LifxDeviceHandler) {
		return this.on('location', handler)
	}

	async setInfrared(brightness: number) {
		return this.emitOnChange(async () =>
			(this.infrared = await this.get(new LightSetInfrared(brightness))), this.infrared)
	}

	async getInfrared() {
		return this.emitOnChange(async () =>
			(this.infrared = await this.get(new LightGetInfrared())), this.infrared)
	}

	onInfrared(handler: LifxDeviceHandler) {
		return this.on('infrared', handler)
	}

	async setPower(on: boolean) {
		return this.reactiveGet('power', async () => this.get(new DeviceSetPower(on)))
	}

	async getPower() {
		return this.reactiveGet('power', async () => this.get(new DeviceGetPower()))
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
		return this.reactiveGet('light', async () => this.get(new LightSetPower(on, duration)))
	}

	async getLight() {
		return this.reactiveGet('light', async () => this.get(new LightGetPower()))
	}

	onLight(handler: LifxDeviceHandler) {
		return this.on('light', handler)
	}

	async fadeOn(duration: number) {
		return this.setLight(true, duration)
	}

	async fadeOff(duration: number) {
		return this.setLight(false, duration)
	}

	async getInfo() {
		return this.reactiveGet('info', async () => this.get(new DeviceGetInfo()))
	}

	async setLabel(label: string) {
		return this.emitOnChange(async () =>
			(this.label = await this.get(new DeviceSetLabel(label))), this.label)
	}

	async getLabel() {
		return this.reactiveGet('label', async () => this.get(new DeviceGetLabel()))
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

	watch(key: string, interval: number) {
		let update: (() => any) | undefined

		if (key === 'power') update = () => this.getPower()
		else if (key === 'light') update = () => this.getLight()
		else if (key === 'color') update = () => this.getColor()

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

	private async emitOnChange<Result>(update: () => Promise<Result>, cached?: Result): Promise<Result> {
		this.cacheState()
		try {
			const result = await update()
			const changed = this.stateChanged()
			if (changed) {
				this.cacheState()
				this.emit('change')
				this.client.emit('change', this)

				changed.forEach((key) => {
					this.emit(key)
					this.client.emit('change_' + key, this)
				})
			}
			return result
		}
		catch (error) {
			if (cached)
				return cached
			throw error
		}
	}

	private async reactiveGet<Result>(key: string, source: () => Promise<Result>): Promise<Result> {
		const device: { [key: string]: any } = this
		try {
			const result = await source.bind(this)()

			if (! objectEqual(device[key], result)) {
				device[key] = result
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
			throw error
		}
	}

	private cacheState() {
		this.state = this.getState()
		return this
	}

	private stateChanged(): Array<string> | null {
		const next = this.getState()
		const changed: Array<string> = []

		LIFX_STATE_KEYS.forEach((key) => {
			if (! this.state)
				changed.push(key)
			// Deep compare objects
			else if (this.state[key] && next[key] && ! objectEqual(this.state[key], next[key])) {
				changed.push(key)
			}
			// If there is no existing state
			else if (next[key])
				changed.push(key)
		})

		// Return the changed keys
		if (changed.length > 0)
			return changed
		return null
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
