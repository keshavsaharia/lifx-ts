import {
	Location,
	Dimension
} from './interface'

const SPACE = ' '
const DASH = '-'

import {
	lineWrap
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

	constructor(size: Dimension) {
		// One byte for the character
		this.text = new Array(size.height || 0).map(() =>
				  Buffer.alloc(size.width || 0, SPACE, 'utf8'))
		this.size = size

		// One byte for color, background, and style
		this.color = new Array(size.height|| 0).map(() => Buffer.alloc(size.width || 0))
		this.background = new Array(size.height|| 0).map(() => Buffer.alloc(size.width || 0))
		this.style = new Array(size.height || 0).map(() => Buffer.alloc(size.width || 0))

		// Single bit for an update mask
		this.update = new Array(size.height).map(() => Buffer.alloc(Math.ceil((size.width || 0) / 8)))
	}

	write(text: string, location: Location, wrap: boolean = false) {
		const output = this.text[location.y]
		const update = this.update[location.y]
		if (! output || ! update || location.x >= output.length)
			return

		// Number of characters available on this line
		const cursor = (location.cursor || 0)
		const available = location.width - cursor

		// Wrap to the next line
		if (text.length > available && wrap) {
			const lines = lineWrap(text, location)
			LogBuffer.updateString(output, update, lines[0], location.x + cursor)

			for (let l = 1 ; l < lines.length ; l++) {
				const lineOutput = this.text[location.y + l]
				const lineUpdate = this.update[location.y + l]
				LogBuffer.updateString(lineOutput, lineUpdate, lines[l], location.x)
			}
		}
		// Write the text onto the line, and cut off any overflow
		else
			LogBuffer.updateString(output, update, text, location.x + cursor)
	}

	private static updateString(buffer: Buffer, update: Buffer, sequence: string, x?: number, end?: number) {
		return LogBuffer.updateByteSequence(buffer, update, Buffer.from(sequence, 'utf8'), x, end)
	}

	private static updateByteSequence(
		buffer: Buffer, update: Buffer,	// The target buffer to write to, and the update bitmask for this buffer
		sequence: Buffer,				// The sequence of bytes to write into the buffer
		x: number = 0,					// The position to write at into the sequence
		end: number = buffer.length		// The number of bytes in the buffer to fill
	) {
		// Shift first update byte
		let bitShift = x % 8

		// Iterate over sequence and set update bits into a full byte before updating
		let updateByte = 0
		for (let byte = 0 ; byte < sequence.length ; byte += 8) {

			// Start first iteration with a bit shift which is set to 0 for subsequent iterations
			let bit = bitShift
			for (; bit < 8 && byte + bit - bitShift < sequence.length ; bit++) {

				// Get indexes to compare sequence against buffer
				const index = byte + bit
				const bufferIndex = x + index
				if (bufferIndex >= end)
					break

				// If there is a new byte to write into the buffer, add it
				// and set the update bit for this byte
				const newByte = sequence.readUint8(index)
				if (buffer.readUint8(bufferIndex) != newByte) {
					buffer.writeUint8(newByte, bufferIndex)
					updateByte = updateByte | 0b1
				}

				// If not last bit, shift the update byte to make space for the next bit
				if (bit != 7)
					updateByte = updateByte << 1
			}

			// Write the update byte into the buffer
			const offset = Math.floor((x + byte) / 8)
			update.writeUint8(update.readUint8(offset) | updateByte, offset)

			// Stop bit shifting after first iteration
			bitShift = 0
		}
	}

	setColor(color: number, area: Dimension) {
		LogBuffer.updateByteArea(this.color, this.update, color, area, this.size)
	}

	setBackground(color: number, area: Dimension) {

	}

	private static updateByteArea(array: Array<Buffer>, update: Array<Buffer>, byte: number, area: Dimension, parent: Dimension) {
		const startX = area.x || 0
		const startY = area.y || 0
		const width = area.width || parent.width || 0
		const height = area.height || parent.height || 0

		for (let y = startY ; y < startY + height ; y++) {
			if (parent.height != null && y > parent.height) break

			// Iterate over lines and update changed bits
			for (let x = startX ; x < startX + width ; x++) {
				if (LogBuffer.setByte(array, x, y, byte))
					LogBuffer.setBit(update, x, y)
			}
		}
	}

	private static setByte(array: Array<Buffer>, x: number, y: number, byte: number) {
		if (y >= 0 && y < array.length) {
			const row = array[y]
			if (x >= 0 && x < row.length && row.readUInt8(x) != byte) {
				row.writeUInt8(byte, x)
				return true
			}
		}
		return false
	}

	private static setBit(bitArray: Array<Buffer>, x: number, y: number, bit: number = 1) {
		if (bitArray.length < y) return

		// Calculate the offset and bitmask to apply
		const offset = Math.floor(x / 8)
		const bitMask = (1 << (bit % 8))
		const byteLine = bitArray[y]
		if (offset >= byteLine.length) return

		// Read the byte containing the bit values
		const byte = byteLine.readUint8(offset)

		// Write the bit if it is not already set
		if ((byte & bitMask) != bit)
			bitArray[y].writeUint8(byte | bitMask, offset)
	}



	resize(size: Dimension) {
		// TODO
	}

	copy() {
		// TODO create new buffer
	}
}
