import LogBuffer from './buffer'

import {
	Dimension,
	Location
} from './interface'

import {
	cropLocation,
	lineWrap,
	padLocation,
	inlineRemaining,
	inlineHeight
} from './util'

export default class LogView {
	parent?: LogView
	child?: Array<LogView | string>
	root?: LogBuffer
	rendering?: boolean

	size: Dimension
	private location: Location | null = null

	constructor(size?: Dimension) {
		this.size = size || {}
	}

	private render(buffer: LogBuffer, location: Location) {}

	/**
	 * @func 	recursiveRender
	 * @desc 	Write into a given LogBuffer and recursively write children
	 */
	private recursiveRender(buffer: LogBuffer) {
		// If this view is not visible
		if (this.location == null)
			return null

		// Render into the buffer
		this.renderInMutex(buffer, this.location)

		if (this.child) {
			const cache = this.location.display
			let offset = 0

			for (let c = 0 ; c < this.child.length ; c++) {
				const child = this.child[c]

				if (child instanceof LogView) {
					child.recursiveRender(buffer)
				}
				else {
					// Get the cached display parameters or regenerate them
					const display = (cache && cache[c]) ? cache[c] :
									cropLocation(this.location, this.size, offset)
					// Add to the offset
					offset += buffer.write(child, display, this.size)
				}
			}
		}

		return this.location
	}

	private renderLocation(location: Location) {
		// First apply any padding before checking if there is no space to render
		if (this.size.padding != null)
			location = padLocation(location, this.size.padding)

		// Empty view or no space to render in
		if (! this.child || location.width <= 0 || location.height <= 0)
			return null

		// If there are absolute size constraints on this view
		if (this.size.width != null && this.size.width < location.width)
			location.width = Math.max(0, this.size.width)
		if (this.size.height != null && this.size.height < location.height)
			location.height = Math.max(0, this.size.height)

		// Constants for calculating total inline or block spacing used
		const inline = this.size.inline === true
		const wrap = this.size.wrap === true
		// Store total space used/lines wrapped/max child size
		let offset = 0

		// If this is an inline view within another inline view that set
		// a cursor position to continue from, otherwise start a new line for a block
		// if not at the start index of the location
		const cursor = inline ? (location.cursor || 0) : 0
		if (! inline && location.cursor != null && cursor > 0)
			offset++

		// Iterate over children and either add string size directly, or compute
		// child size of nested views recursively, then remove cached locations for
		// children that are not visible
		let c = 0
		for (; c < this.child.length ; c++) {
			const child = this.child[c]
			const display = cropLocation(location, this.size, offset)

			// Recursively render location with remaining available space
			if (child instanceof LogView) {
				child.location = child.renderLocation(display)
				if (! child.location)
					continue

				// Add either the inline offset, or the block height, to the total offset
				offset += inline ? (child.location.offset || 0) : child.location.height
			}
			// String case
			else {
				// Cache display object for rendering
				if (! location.display)
					location.display = {}
				location.display[c] = display

				// If it is a string in an inline container
				if (inline) {
					const available = inlineRemaining(location, offset)
					if (wrap && child.length > available)
						offset += LogBuffer.lineWrapOffset(child, display)
					else
						offset += Math.min(child.length, available)
				}
				// String in a block container
				else {
					// Compute line wrap and add lines to space
					if (wrap && child.length > location.width)
						offset += lineWrap(child, display).length
					// Use one line of space
					else offset++
				}
			}

			// Stop calculating size if all space is offset in an inline wrapped space
			if (inline) {
				if (wrap && inlineHeight(location, offset) > location.height)
					break
			}
			// If a block container has gone past the height
			else if (offset >= location.height)
				break
		}

		// If this is an inline container, calculate the consumed height and pass the total offset
		if (inline) {
			location.height = inlineHeight(location, offset)
			location.offset = offset
		}
		// For block elements
		else {
			// If this view did not fill the location, set to total offset space
			location.height = Math.min(offset, location.height)
			location.offset = offset
		}

		return location
	}

	private renderInMutex(buffer: LogBuffer, location: Location) {
		this.rendering = true
		this.render(buffer, location)
		this.rendering = false
		return this
	}

	setSize(size: Dimension) {
		if (! this.rendering)
			this.size = size
		return this
	}

	private setParent(parent: LogView) {
		if (this.rendering)
			throw {}

		this.parent = parent
		// Pass size properties
		if (this.size.inline && parent.size.inline)
			this.size.wrap = parent.size.wrap
		return this
	}

	add(...children: Array<LogView | string>) {

		if (! this.child)
			this.child = []
		for (let i = 0 ; i < children.length ; i++) {
			const child = children[i]
			if (child instanceof LogView)
				child.setParent(this)
			this.child.push(child)
		}
		return this
	}

	log() {
		if (! this.root && ! this.parent)
			this.root = new LogBuffer(30, 15)

		if (this.root) {
			this.renderLocation({
				x: 0, y: 0,
				width: this.getWidth(),
				height: this.getHeight()
			})
			this.recursiveRender(this.root)
			this.root.render()
		}
		else if (this.parent)
			this.parent.log()
	}

	/**
	 * @func 	update
	 * @desc 	Recursively calls update on children and sets flags on parent viewer
	 */
	update() {

	}

	getWidth(): number {
		return (this.size && this.size.width != null) ?
			this.size.width : (this.parent ? this.parent.getWidth() : 0)
	}

	getHeight(): number {
		return (this.size && this.size.height != null) ?
			this.size.height : (this.parent ? this.parent.getHeight() : 0)
	}
}
