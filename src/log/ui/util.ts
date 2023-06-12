import {
	Location,
	Dimension
} from './interface'

const SPACE = ' '

export function cropLocation(location: Location, display: Dimension, offset: number): Location {
	if (display.inline) {
		// Get the new cursor and line from calculating lines wrapped
		const startCursor = location.cursor || 0
		const cursor = (startCursor + offset) % location.width
		const wrapped = display.wrap ? Math.floor((startCursor + offset) / location.width) : 0

		return {
			cursor,
			x: location.x,
			y: location.y + wrapped,
			width: display.wrap ? location.width : Math.max(0, location.width - cursor),
			height: location.height - wrapped
		}
	}
	else
		return {
			x: location.x,
			y: location.y + offset,
			width: location.width,
			height: Math.max(0, location.height - offset)
		}
}

export function padLocation(location: Location, pad: Array<number> | number): Location {
	const padding = Array.isArray(pad) ? (pad.length == 2 ? pad.concat(pad) : pad) : [ pad, pad, pad, pad ]
	if (padding.length != 4)
		return location

	return {
		cursor: location.cursor != null ? location.cursor + padding[3] : undefined,
		x: location.x + padding[3],
		y: location.y + padding[0],
		width: location.width - padding[1] - padding[3],
		height: location.height - padding[0] - padding[2]
	}
}

export function lineWrap(text: string, location: Location): Array<string> {
	const cursor = location.cursor || 0
	// Edge case to prevent infinite recursion if cursor is at end of line
	if (cursor >= location.width)
		return [ '', ...lineWrap(text, { ...location, cursor: 0 }) ]
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
		...lineWrap(text.substring(endIndex).replace(/^\s+/, ''), {
			...location,
			cursor: 0
		})
	]
}

export function inlineRemaining(location: Location, offset: number = 0) {
	return location.width - (((location.cursor || 0) + offset) % location.width)
}

export function inlineHeight(location: Location, offset: number = 0) {
	return Math.ceil(((location.cursor || 0) + offset) / location.width)
}
