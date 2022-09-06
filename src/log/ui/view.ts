import LogBuffer from './buffer'

import {
	Dimension,
	Location
} from './interface'

import {
	cropLocation,
	lineWrap,
	padLocation
} from './util'

export default class LogView {
	parent?: LogView
	child?: Array<LogView | string>
	rendering?: boolean

	size: Dimension
	private location: Location | null = null

	constructor(size?: Dimension) {
		this.size = size || {}
	}

	render(buffer: LogBuffer, location: Location) {}

	/**
	 * @func 	recursiveRender
	 * @desc 	Write into a given LogBuffer and recursively write children
	 */
	private recursiveRender(buffer: LogBuffer, cursor: number = 0) {
		// If this view is not visible
		if (this.location == null)
			return

		// Render into the buffer
		this.location.cursor = cursor
		this.renderInMutex(buffer, this.location)

		if (this.child) {
			const inline = this.size.inline === true
			const wrap = this.size.wrap === true
			let used = 0

			for (let c = 0 ; c < this.child.length ; c++) {
				const child = this.child[c]

				if (child instanceof LogView) {
					child.recursiveRender(buffer)
				}
				else if (inline) {

				}
				else {
					buffer.write(child, {
						...this.location,
						y: this.location.y + 4
					})
				}

			}
		}
		// Start rendering of this element in the background
		this.render(buffer, location)

		// Perform rendering of visible child elements next in the foreground
		for (let c = 0 ; c < placement.length ; c++) {
			const child = this.child[c]
			const display = placement[c]

			if (child instanceof LogView)
				child.recursiveRender(buffer, display)
			else
				buffer.write(child, display)
		}

		return null
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
		const space = inline ? location.width : location.height
		// Store total space used/lines wrapped/max child size
		let used = 0, max = 0

		// If this is an inline view within another inline view that set
		// a cursor position to continue from, otherwise start a new line for a block
		// if not at the start index of the location
		const cursor = inline ? (location.cursor || 0) : 0
		if (! inline && location.cursor != null && cursor > 0)
			used++

		// Iterate over children and either add string size directly, or compute
		// child size of nested views recursively, then remove cached locations for
		// children that are not visible
		let c = 0
		for (; c < this.child.length ; c++) {
			const child = this.child[c]

			// Recursively render location with remaining available space
			if (child instanceof LogView) {
				const available = cropLocation(location, used, inline, wrap)
				child.location = child.renderLocation(available)
				if (! child.location)
					continue

				if (inline) {
					if (wrap && child.location.height > 1) {

					}
					// Always set at end of recursive call to renderLocation by inline elements
					else if (child.location.cursor != null) {

					}
				}
				else used += child.location.height
			}
			// If it is a string in an inline container
			else if (inline) {
				const available = space - ((cursor + used) % space)
				if (wrap && child.length > available) {
					const lines = lineWrap(child, cropLocation(location, used, inline, wrap))
					const lastLine = lines[lines.length - 1]
					used += available + lines.length * location.width + lastLine.length
				}
				else {
					used += Math.min(child.length, space - used)
					max = 1
				}
			}
			// String in a block container
			else {
				// Compute line wrap and add lines to space
				if (wrap && child.length > space) {
					const lines = lineWrap(child, cropLocation(location, used))
					used += lines.length
				}
				// Use one line of space
				else used++
			}

			// Stop calculating size if all space is used in an inline wrapped space
			if (inline && wrap) {
				// If line wrap is past the height
				if (Math.floor(used / location.width) > location.height)
					break
			}
			else if (used >= space)
				break
		}

		// Remove cached locations for any remaining children that are not being displayed
		for (; c < this.child.length ; c++) {
			const child = this.child[c]
			if (child instanceof LogView)
				child.location = null
		}

		// If this is an inline container, calculate the consumed size
		if (inline) {
			location.width = used < space ? used : space
			location.height = wrap ? Math.ceil(used / space) : max
			// Pass the new cursor value up
			location.cursor = used % space
		}
		// For block elements
		else {
			// If this view did not fill the location, set to total used space
			if (used < space)
				location.height = used
			location.cursor = 0
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

	setParent(parent: LogView) {
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



	/**
	 * @func 	update
	 * @desc 	Recursively calls update on children and sets flags on parent viewer
	 */
	update() {

	}


	getX() {
		return this.size ? this.size.x : 0
	}

	getY() {
		return this.size ? this.size.y : 0
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
