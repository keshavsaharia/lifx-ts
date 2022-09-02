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
	LifxDeviceHandler,
	LifxStateHandler,
	DeviceState,
	ResultObject
} from './interface'

import {
	RGBtoHSB,
	CSStoHSB,
	objectEqual
} from './util'

import {
	PING_TIMEOUT,
	DEFAULT_INTERVAL,
	LIFX_PORT,
	LIFX_PRODUCT,
	LIFX_STATE_KEYS,
	LIFX_FEATURES,
	RATE_LIMIT,
	DEFAULT_TEMPERATURE
} from './constant'

import {
	DeviceFeatureError
} from './error'

export default class LifxDevice {
	private client: LifxClient
	private ip: string
	private mac: string
	private port: number
	private alive: boolean

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
	handler: { [event: string]: Array<LifxStateHandler<any>> }
	watcher: { [key: string]: NodeJS.Timer }
	updated: { [key: string]: number }

	// Timestamp of last message
	message?: number

	// Caches a JSON representation of the device state, so updates
	// are triggered when any part of this object changes
	state: DeviceState

	/**
	 * @constructor
	 */
	constructor(client: LifxClient, ip: string, mac: string, port?: number) {
		this.client = client
		this.ip = ip
		this.mac = mac
		this.port = port || LIFX_PORT
		this.alive = true
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
		this.alive = false
		return this.client.removeDevice(this)
	}

	onChange(handler: LifxStateHandler<LifxDevice>) {
		return this.on('change', handler)
	}

	async send(packet: Packet<any>) {
		try {
			return this.client.send(packet, this)
		}
		catch (error) {}
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
		return this.reactive('firmware', async () => this.get(new DeviceGetFirmware()))
	}

	async getVersion() {
		const version = await this.reactive('version', async () => await this.get(new DeviceGetVersion()))
		this.loadProduct()
		return version
	}

	async echo(text: string) {
		const result = await this.get(new DeviceEchoPacket(text))
		if (result)
			return result.text
	}

	async reboot() {
		await this.send(new DeviceRebootPacket())
		this.remove()
		return this
	}

	async setCSS(css: string) {
		return this.setColor({
			...CSStoHSB(css),
			kelvin: this.getTemperature()
		})
	}

	async setRGB(r: number, g: number, b: number, a?: number) {
		return this.setColor({
			...RGBtoHSB(r, g, b, a),
			kelvin: this.getTemperature()
		})
	}

	async setColor(color: LightColor, duration?: number) {
		return this.reactiveSet('color', color, () => this.get(new LightSetColor(color, duration)))
	}

	async getColor() {
		return this.reactive('color', () => this.get(new LightGetColor()))
	}

	onColor(handler: LifxStateHandler<LightColor>) {
		return this.on('color', handler)
	}

	watchColor(interval?: number) {
		return this.watch('color', interval || DEFAULT_INTERVAL)
	}

	async setTemperature(kelvin: number, duration?: number) {
		if (! this.product || ! this.product.temperature)
			return

		const temperature = this.product.temperature
		kelvin = Math.max(temperature.min, Math.min(kelvin, temperature.max))
		const color = await this.getColor()
		if (color) {
			await this.setColor({
				...color,
				kelvin
			}, duration)
		}
	}

	async setGroup(id: string, label: string) {
		const group = { id, label, updated: Date.now() }
		return this.reactiveSet('group', group, () => this.get(new DeviceSetGroup(id, label)))
	}

	async getGroup() {
		return this.reactive('group', () => this.get(new DeviceGetGroup()))
	}

	onGroup(handler: LifxStateHandler<DeviceGroup>) {
		return this.on('group', handler)
	}

	watchGroup(interval?: number) {
		return this.watch('group', interval || DEFAULT_INTERVAL)
	}

	async setLocation(id: string, label: string) {
		const location = { id, label, updated: Date.now() }
		return this.reactiveSet('location', location, () => this.get(new DeviceSetLocation(id, label)))
	}

	async getLocation() {
		return this.reactive('location', () => this.get(new DeviceGetLocation()))
	}

	onLocation(handler: LifxStateHandler<DeviceGroup>) {
		return this.on('location', handler)
	}

	watchLocation(interval?: number) {
		return this.watch('location', interval || DEFAULT_INTERVAL)
	}

	async setInfrared(brightness: number) {
		return this.reactiveSet('infrared', { brightness }, () => this.get(new LightSetInfrared(brightness)))
	}

	async getInfrared() {
		return this.reactive('infrared', () => this.get(new LightGetInfrared()))
	}

	onInfrared(handler: LifxStateHandler<LightInfrared>) {
		return this.on('infrared', handler)
	}

	watchInfrared(interval?: number) {
		return this.watch('infrared', interval || DEFAULT_INTERVAL)
	}

	async setPower(on: boolean) {
		return this.reactiveSet('power', { on }, () => this.get(new DeviceSetPower(on)))
	}

	async getPower() {
		return this.reactive('power', () => this.get(new DeviceGetPower()))
	}

	onPower(handler: LifxStateHandler<DevicePower>) {
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
		return this.reactive('light', () => this.get(new LightSetPower(on, duration)))
	}

	async getLight() {
		return this.reactive('light', () => this.get(new LightGetPower()))
	}

	onLight(handler: LifxStateHandler<LightPower>) {
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
		return this.reactive('info', () => this.get(new DeviceGetInfo()))
	}

	onInfo(handler: LifxStateHandler<DeviceInfo>) {
		return this.on('info', handler)
	}

	watchInfo(interval?: number) {
		return this.watch('info', interval || DEFAULT_INTERVAL)
	}

	async setLabel(label: string) {
		return this.reactive('label', () => this.get(new DeviceSetLabel(label)))
	}

	async getLabel() {
		return this.reactive('label', () => this.get(new DeviceGetLabel()))
	}

	onLabel(handler: LifxStateHandler<DeviceLabel>) {
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

	hasFeature(key: string) {
		// Filter if the product is set
		if (this.product && LIFX_FEATURES.includes(key))
			return this.product.features.hasOwnProperty(key)
		// Only keys for updating the state
		return LIFX_STATE_KEYS.includes(key)
	}

	getTemperature() {
		if (this.color)
			return this.color.kelvin
		// Start at middle of temperature range
		if (this.product && this.product.temperature)
			return (this.product.temperature.max + this.product.temperature.min) / 2
		// Default temperature
		return DEFAULT_TEMPERATURE
	}

	hasTemperature() {
		return this.product && this.product.temperature != null
	}

	getTemperatureRange(): { min: number, max: number } | undefined {
		if (this.product)
			return this.product.temperature
	}

	getMinTemperature(): number {
		if (this.product && this.product.temperature)
			return this.product.temperature.min
		return DEFAULT_TEMPERATURE
	}

	getMaxTemperature(): number {
		if (this.product && this.product.temperature)
			return this.product.temperature.max
		return DEFAULT_TEMPERATURE
	}

	on<R>(event: string, handler: LifxStateHandler<R>) {
		if (! this.handler[event])
			this.handler[event] = []
		this.handler[event].push(handler)
		return this
	}

	/**
	 * @func	off
	 * @desc	Stop a specific handler or all handlers for the event
	 * @param  {string} event
	 */
	off(event: string, handler?: LifxStateHandler<any>) {
		const handlers = this.handler[event]
		if (handlers && handler) {
			const index = handlers.findIndex((h) => (h == handler))
			if (index >= 0)
				handlers.splice(index, 1)
		}
		else delete this.handler[event]
		return this
	}

	private emit<R>(event: string, result?: R) {
		if (this.handler[event])
			this.handler[event].forEach((handler) => {
				try {
					if (result)
						(handler as LifxStateHandler<R>)(result, this)
					else
						(handler as LifxStateHandler<LifxDevice>)(this, this)
				}
				catch (error) {
					console.log('handler for ' + event + ' failed', error)
				}
			})
	}

	/**
	 * @func	monitor
	 * @desc
	 */
	monitor(keys?: Array<string> | string) {
		this.watch(keys || LIFX_STATE_KEYS, DEFAULT_INTERVAL)
		return this
	}

	/**
	 * @func 	watch
	 * @desc 	Send periodic requests to the device for the latest state
	 * @returns {LifxClient}
	 */
	private watch(key: Array<string> | string, interval: number): LifxDevice {
		if (Array.isArray(key)) {
			key.forEach((k) => this.watch(k, interval))
			return this
		}

		// Ignore features that are not on this device
		if (! this.hasFeature(key))
			return this

		// Map key to watcher function
		let update: (() => any) | undefined
		if (key === 'power') update = () => this.getPower()
		else if (key === 'light') update = () => this.getLight()
		else if (key === 'color') update = () => this.getColor()
		else if (key === 'infrared') update = () => this.getInfrared()
		else if (key === 'group') update = () => this.getGroup()
		else if (key === 'location') update = () => this.getLocation()
		else if (key === 'label') update = () => this.getLabel()
		else if (key === 'info') update = () => this.getInfo()
		else if (key === 'firmware') update = () => this.getFirmware()

		if (update)
			return this.addWatcher(key, interval, update.bind(this))
		return this
	}

	private addWatcher(key: string, interval: number, update: () => Promise<any>): LifxDevice {
		this.stopWatcher(key)
		this.watcher[key] = setInterval(() => {
			try {
				update()
			}
			catch (error) {}
		}, interval)
		return this
	}

	private stopWatcher(key: string): LifxDevice {
		if (this.watcher[key])
			clearInterval(this.watcher[key])
		return this
	}

	stopMonitoring(): LifxDevice {
		Object.keys(this.watcher).forEach((key) => {
			clearInterval(this.watcher[key])
		})
		this.watcher = {}
		this.handler = {}
		return this
	}

	/**
	 * @func 	reactiveSet
	 * @desc 	Async wrapper for transmissions that update a device value. Waits until
	 * 			the source function has produced a result and fires events
	 * 			with the new value.
	 * @param 	{string} key - key that is set by result of source function
	 * @param 	{Function} source - a function that produces a `Promise`
	 * @returns {Promise<Result>}
	 */
	private async reactiveSet<Result>(key: string, value: Result, source: () => Promise<Result>): Promise<Result> {
		if (! this.hasFeature(key))
			throw DeviceFeatureError

		const device: ResultObject = this
		const state: ResultObject = this.state

		try {
			const result: Result = await source.bind(this)()

			if (result != null) {
				device[key] = state[key] = value
				this.emit('change', this)
				this.emit(key, value)
			}

			// Emit to client listeners
			this.client.emit('change', this)
			this.client.emit('change_' + key, this)

			return value
		}
		catch (error) {
			// Disconnect the device if the request timed out
			if (error.code === 'device_timeout')
				this.remove()
			// Return new value
			return value
		}
	}

	/**
	 * @func 	reactive
	 * @desc 	Async wrapper for transmissions that produce a response. Waits until
	 * 			the source function has produced a result, then emits events if the
	 * 			result is a new value for the given key.
	 * @param 	{string} key - key that is set by result of source function
	 * @param 	{Function} source - a function that produces a `Promise`
	 * @returns {Promise<Result>}
	 */
	private async reactive<Result>(key: string, source: () => Promise<Result>): Promise<Result> {
		if (! this.hasFeature(key))
			throw DeviceFeatureError

		const device: ResultObject = this
		const state: ResultObject = this.state

		try {
			const result: Result = await source.bind(this)()
			console.log('result', result)
			if (result != null && ! objectEqual(device[key], result)) {
				console.log('setting', key)
				device[key] = result
				state[key] = result

				console.log('set', device[key])

				// Emit to device listeners
				this.emit('change', this)
				this.emit(key, result)

				// Emit to client listeners
				this.client.emit('change', this)
				this.client.emit('change_' + key, this)
			}
			return result
		}
		catch (error) {
			// Disconnect the device if the request timed out
			if (error.code === 'device_timeout')
				this.remove()
			// Return cached value if there is one, otherwise throw the error
			if (device[key])
				return device[key]
			throw error
		}
	}

	/**
	 * @func 	getState
	 * @desc 	Returns a JSON object describing the full device state.
	 * @returns {Object}
	 */
	getState(): DeviceState {
		const device: ResultObject = this
		const state: ResultObject = {
			ip: this.ip,
			mac: this.mac,
			port: this.port,
			alive: this.alive,
			product: this.product
		}
		LIFX_STATE_KEYS.forEach((key) => {
			if (device[key])
				state[key] = device[key]
		})
		return state as DeviceState
	}

	private cacheState() {
		this.state = this.getState()
		return this
	}

	getName(): string {
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

	/**
	 * @func 	loadProduct
	 * @desc 	Loads the product information for this device from the data provided by Lifx.
	 * @see 	data/products.json
	 */
	private loadProduct() {
		if (this.version)
			this.product = LIFX_PRODUCT[this.version.product]
		return this
	}

	/**
	 * @func 	canSend
	 * @desc 	Returns true if the device has not received a message in the given amount of time.
	 * 			If this function returns true, a subsequent invocation within the rate limit duration
	 * 			will return false.
	 * @see 	dequeue() in client.ts
	 * @param 	{number} rateLimit - optional limit (default is 50)
	 * @return 	{boolean} message can be sent
	 */
	canSend(rateLimit?: number): boolean {
		const now = Date.now()

		// Message has not been sent yet, or within threshold
		if (this.message == null || (this.message + (rateLimit || RATE_LIMIT) < now)) {
			this.message = now
			return true
		}
		// Wait until message time is within rate limit
		return false
	}

	toString() {
		const str = [this.getName(), ' (', this.getIP(), ', ', this.getMacAddress(), ')']
		return str.join('')
	}
}
