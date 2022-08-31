import {
	LightColor
} from '../interface'

import {
	isHSBValue
} from '../util'

import {
	HSBValueError,
	KelvinValueError,
	PayloadError
} from '../error'

export default class Payload {
	buffer: Buffer
	offset: number

	constructor(init: Buffer | number) {
		if (Buffer.isBuffer(init))
			this.buffer = init
		else
			this.buffer = Buffer.alloc(init)

		this.offset = 0
		return this
	}

	size() {
		return this.buffer.length
	}

	/**
	 * Increment the payload offset index
	 */
	addOffset(amount?: number) {
		this.offset += (amount == null) ? 1 : amount
		return this
	}

	addByte(byte: number) {
		this.validateOffset(1)
		this.buffer.writeUInt8(byte, this.offset)
		this.addOffset(1)
		return this
	}

	getByte(): number {
		this.validateOffset(1)
		const byte = this.buffer.readUInt8(this.offset)
		this.addOffset(1)
		return byte
	}

	addRatio(ratio: number) {
		this.validateOffset(2)
		this.buffer.writeUInt16LE(Math.round(ratio * 65535), this.offset)
		this.addOffset(2)
		return this
	}

	getRatio() {
		this.validateOffset(2)
		const ratio = this.buffer.readUInt16LE(this.offset) / 65535
		this.addOffset(2)
		return ratio
	}

	addShort(short: number) {
		this.validateOffset(2)
		this.buffer.writeUInt16LE(short, this.offset)
		this.addOffset(2)
		return this
	}

	getShort() {
		this.validateOffset(2)
		const short = this.buffer.readUInt16LE(this.offset)
		this.addOffset(2)
		return short
	}

	addInt(int: number) {
		this.validateOffset(4)
		this.buffer.writeUInt32LE(int, this.offset)
		this.addOffset(4)
		return this
	}

	getInt(): number {
		this.validateOffset(4)
		const int = this.buffer.readUInt32LE(this.offset)
		this.addOffset(4)
		return int
	}

	addString(str: string, length: number) {
		this.validateOffset(length)
		this.buffer.write(str, this.offset, 'utf8')
		this.addOffset(length)
		return this
	}

	getString(length: number): string {
		this.validateOffset(length)

		// Find the first terminating byte (0x00)
		let i = 0
		for (; i < length ; i++)
			if (this.buffer.readUint8(this.offset + i) == 0) break

		// Return the UTF8 string up to the last terminating byte, or the full length
		const str = this.buffer.slice(this.offset, this.offset + i).toString('utf8')
		this.addOffset(length)
		return str
	}

	addColor(color: LightColor) {
		this.validateOffset(8)

		// Add hue, saturation, and brightness
		if (! isHSBValue(color.hue))
			throw HSBValueError('hue', color.hue)
		this.addRatio(color.hue)
		if (! isHSBValue(color.saturation))
			throw HSBValueError('saturation', color.saturation)
		this.addRatio(color.saturation)
		if (! isHSBValue(color.brightness))
			throw HSBValueError('brightness', color.brightness)
		this.addRatio(color.brightness)

		// Kelvin temperature
		if (color.kelvin < 1500 || color.kelvin > 9000)
			throw KelvinValueError(color.kelvin)
		this.addShort(color.kelvin)
	}

	getColor(): LightColor {
		this.validateOffset(8)
		const hue = parseFloat((this.buffer.readUInt16LE(this.offset) / 65535).toFixed(5))
		const saturation = parseFloat((this.buffer.readUInt16LE(this.offset + 2) / 65535).toFixed(5))
		const brightness = parseFloat((this.buffer.readUInt16LE(this.offset + 4) / 65535).toFixed(5))
		const kelvin = this.buffer.readUInt16LE(this.offset + 6)
		this.addOffset(8)

		return {
			hue,
			saturation,
			brightness,
			kelvin
		}
	}

	/**
	 * @func 	addTimestamp
	 * @desc 	Write the given timestamp
	 */
	addTimestamp(time?: Date | number) {
		// Convert millisecond timestamp to nanoseconds
		const t = ((time == null) ? Date.now() :
			((typeof time === 'number' ? time : time.getTime()))) * 1000000

		this.validateOffset(8)
		this.buffer.writeUIntLE(t, this.offset + 2, 6)
		this.addOffset(8)
		return this
	}

	/**
	 * @func 	getTimestamp
	 * @desc 	Read back a time in UNIX epoch format
	 */
	getTimestamp() {
		this.validateOffset(8)
		// Convert timestamp from nanoseconds
		const timestamp = this.buffer.readUIntLE(this.offset + 2, 6) * (Math.pow(2, 16) / 1000000)
		this.addOffset(8)
		return timestamp
	}

	/**
	 * @func 	validateOffset
	 * @desc 	Validate the given number of bytes are still available in the payload buffer
	 */
	private validateOffset(bytes: number) {
		if (this.offset + bytes > this.buffer.length)
			throw PayloadError
		return true
	}

	/**
	 * @func 	validateFilled
	 * @desc 	Validate the payload has been filled with the expected number of bytes
	 */
	validateFilled() {
		if (this.offset != this.buffer.length)
			throw PayloadError
		return true
	}

	/**
	 * @func 	validateSize
	 * @desc 	Validate the payload is of the given size
	 */
	validateSize(size: number) {
		if (size != this.buffer.length)
			throw PayloadError
		return true
	}
}
