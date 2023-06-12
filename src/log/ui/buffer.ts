import {
	Location,
	Dimension
} from './interface'

const SPACE = ' '
const DASH = '-'

// Styles
const BOLD = 		0b00000001
const DIM = 		0b00000010
const ITALIC = 		0b00000100
const UNDERLINE = 	0b00001000
const BLINK = 		0b00010000
const STRIKE = 		0b00100000
const INVERSE = 	0b01000000
const CONCEAL = 	0b10000000

import {
	inlineRemaining
} from './util'

export default class LogBuffer {
	// The content of the view
	text: Array<Buffer>
	size: Dimension

	// Styling to apply to the view
	color: Array<Buffer>
	background: Array<Buffer>
	style: Array<Buffer>

	// Update bit
	update: Array<Buffer>

	constructor(width: number, height: number) {
		// One byte for the character
		this.size = { width, height }
		this.text = new Array(height)
		this.color = new Array(height)
		this.background = new Array(height)
		this.style = new Array(height)
		this.update = new Array(height)

		for (let y = 0 ; y < height ; y++) {
			this.text[y] = Buffer.alloc(width, SPACE)
			this.color[y] = Buffer.alloc(width)
			this.background[y] = Buffer.alloc(width)
			this.style[y] = Buffer.alloc(width)
			this.update[y] = Buffer.alloc(Math.ceil(width / 8))
		}
	}

	write(text: string, location: Location, display: Dimension): number {
		console.log('writing', text, location, display)
		const output = this.text[location.y]
		const update = this.update[location.y]
		if (! output || ! update || location.x >= output.length)
			return 0

		// Number of characters available on this line
		const x = location.x
		const y = location.y
		// const width = location.width
		const cursor = (location.cursor || 0)
		const available = location.width - cursor

		// If the text can be wrapped to the next line
		if (display.wrap && text.length > available) {
			// Get an array of lines to wrap, and remove any overflow
			const wrapped = location.wrap || LogBuffer.lineWrap(text, location)
			wrapped.splice(location.height)

			// Write the first line at the cursor position
			LogBuffer.updateString(output, update, wrapped[0], x + cursor)
			// Write subsequent wrapped lines at starting cursor position
			for (let line = 1 ; line < wrapped.length ; line++)
				LogBuffer.updateString(this.text[y + line], this.update[y + line], wrapped[line], x)
			// Return the bytes written to calculate the next cursor position
			if (display.inline)
				return available + (wrapped.length - 2) * location.width + wrapped[wrapped.length - 1].length
			else
				return wrapped.length
		}
		// Write the text onto the line, and cut off any overflow
		else {
			const offset = LogBuffer.updateString(output, update, text, x + cursor, x + location.width)
			return display.inline ? offset : 1
		}
	}

	private static updateString(buffer: Buffer, update: Buffer, sequence: string, x?: number, end?: number): number {
		return LogBuffer.updateByteSequence(buffer, update, Buffer.from(sequence, 'utf8'), x, end)
	}

	private static updateByteSequence(
		buffer: Buffer, update: Buffer,	// The target buffer to write to, and the update bitmask for this buffer
		sequence: Buffer,				// The sequence of bytes to write into the buffer
		x: number = 0,					// The position to write at into the sequence
		end: number = buffer.length		// The number of bytes in the buffer to fill
	): number {
		// Iterate over sequence and set update bits into a full byte before updating
		let updateByte = 0
		let startBit = x % 8

		// Iterate over groups of 8 bytes to set the update bits
		for (let byte = 0 ; byte < sequence.length && x + byte < buffer.length ; byte += 8) {

			// Start first iteration with a bit shift which is set to 0 for subsequent iterations
			for (let bit = startBit ; bit < 8 ; bit++) {

				// Get indexes to compare sequence against buffer
				const index = byte + bit - startBit
				const bufferIndex = x + index
				// Terminate loop and set update byte
				if (index >= sequence.length || bufferIndex >= end) {
					// Shift update byte by remaining bits to align properly
					updateByte = updateByte << (8 - bit)
					break
				}

				// If there is a new byte to write into the buffer, add it
				// and set the update bit for this byte
				const newByte = sequence.readUint8(index)
				if (buffer.readUint8(bufferIndex) != newByte) {
					buffer.writeUint8(newByte, bufferIndex)
					updateByte = updateByte | 1
				}

				// If not last bit, shift the update byte to make space for the next bit
				if (bit != 7)
					updateByte = updateByte << 1
			}

			// Write the update byte into the buffer
			const updateIndex = Math.floor((x + byte) / 8)
			update.writeUint8(update.readUint8(updateIndex) | updateByte, updateIndex)

			// Stop offsetting bits after first iteration
			startBit = 0
		}

		// Return total bytes written
		return Math.min(sequence.length, buffer.length - x)
	}

	setColor(color: number, area: Location) {
		LogBuffer.updateByteArea(this.color, this.update, color, area)
	}

	setBackground(color: number, area: Location) {

	}

	private static updateByteArea(array: Array<Buffer>, update: Array<Buffer>, value: number, area: Location) {
		if (array.length == 0) return
		// Parse location
		const startX = Math.min(Math.max(0, area.x), array[0].length),
			  startY = Math.min(Math.max(0, area.y), array.length),
		 	  endX = Math.min(startX + Math.max(0, area.width), array[0].length),
		 	  endY = Math.min(startY + Math.max(0, area.height), array.length)

		// Iterate over each target row
		for (let y = startY ; y < endY ; y++) {
			const line = array[y]

			// Update bitmask and starting bit index for first byte
			let updated = 0
			let startBit = startX % 8

			// Iterate over row in groups of 8 bytes
			for (let byte = startX ; byte < endX ; byte += 8) {
				for (let bit = startBit ; bit < 8 ; bit++) {

					// Use bit index and initial offset to calculate iterated index
					const index = byte + bit - startBit
					if (index >= endX) {
						updated = updated << (8 - bit)
						break
					}

					// If the array value is changing, set the update bit
					const current = line.readUint8(index)
					if (current != value) {
						line.writeUint8(value, index)
						updated = updated | 1
					}

					// Make a space for the next bit
					if (bit != 7)
						updated = updated << 1
				}

				// Insert the update byte into the buffer and clear the bit offset
				const updateIndex = Math.floor(byte / 8)
				update[y].writeUint8(update[y].readUint8(updateIndex) | updated, updateIndex)
				startBit = 0
			}
		}
	}

	static lineWrapOffset(text: string, location: Location) {
		// Do a line wrap operation and cache the results
		const line = LogBuffer.lineWrap(text, location)
		location.wrap = line

		return inlineRemaining(location) + (line.length - 2) * location.width +
			(line.length > 1 ? line[line.length - 1].length : 0)
	}

	private static lineWrap(text: string, location: Location): Array<string> {
		const cursor = location.cursor || 0
		// Edge case to prevent infinite recursion if cursor is at end of line
		if (cursor >= location.width)
			return [ '', ...LogBuffer.lineWrap(text, { ...location, cursor: 0 }) ]
		// If the text fits on this line
		if (cursor + text.length <= location.width)
			return [ text ]

		// Get the last space character or break the string as-is
		const wrapIndex = location.width - cursor
		const lastSpace = text.substring(0, wrapIndex).lastIndexOf(SPACE)
		const endIndex = lastSpace >= 0 ? lastSpace : wrapIndex

		// Recursively wrap the lines
		return [
			text.substring(0, endIndex),
			...LogBuffer.lineWrap(text.substring(endIndex).replace(/^\s+/, ''), {
				...location,
				cursor: 0
			})
		]
	}

	render() {
		for (let y = 0 ; y < this.text.length ; y++) {
			console.log(this.text[y].toString('utf8'))
		}
	}

	resize(size: Dimension) {
		// TODO
	}

	copy() {
		// TODO create new buffer
	}
}
