import {
	LogContent,
	LogConstraint,
	KeyHandler,
	KeypressHandler,
	Keypress
} from '../interface'

import {
	repeated
} from '../util'

const SPACE = ' '
const EOL = '\n'
const EMPTY = ''

import {
	ANSI_REGEX
} from '../constant'

export default class LogFragment {
	// Content in this fragment, and a flag for whether it changes
	content: Array<LogFragment | string>
	static: boolean = true
	focus: boolean = false

	// Foreground/background color
	fgColor?: number
	fgBright?: boolean
	bgColor?: number
	bgBright?: boolean
	keyHandler?: KeyHandler | null

	// Cache generated output
	cacheKeyHandler?: KeyHandler | null

	constructor(...args: Array<LogContent>) {
		this.content = []
		args.forEach((arg) => this.add(arg))
	}

	append<LF extends LogFragment>(cls: { new(): LF }): LF {
		const instance = new cls()
		this.add(instance)
		return instance
	}

	text(content: LogContent) {
		this.add(content)
		return this
	}

	add(content: LogContent) {
		if (Array.isArray(content))
			content.forEach((c) => {
				if (Array.isArray(c))
					this.add(c)
				else
					this.content.push(c)
			})
		else
			this.content.push(content)
		return this
	}

	addText(content?: LogContent) {
		const text = new LogText()
		if (content)
			text.add(content)
		this.add(text)
		return text
	}

	addLine(content?: LogContent) {
		const line = new LogFragment()
		if (content)
			line.add(content)
		this.add(line).add(EOL)
		return line
	}

	render(constraint: LogConstraint) {
		const lines = this.toString().split('\n')
		const corner = constraint.corner || []
		let border = constraint.border || []
		let padding = constraint.padding || []

		// Duplicate top/bottom and left/right
		if (border.length == 2)
			border = border.concat(border)
		if (padding.length == 2)
			padding = padding.concat(padding)

		// Calculate border width from top, right, bottom, left array
		const borderWidth = (border[1] || '').length + (border[3] || '').length
		const paddingWidth = (padding[1] || '').length + (padding[3] || '').length
		const innerWidth = constraint.width - borderWidth
		const lineWidth = innerWidth - paddingWidth

		const output: Array<string> = []

		// Top border
		if (border[0])
			output.push(
				corner[0] || border[0] || EMPTY,
				repeated(border[0], innerWidth),
				corner[1] || border[1] || EMPTY, EOL)
		// Top padding
		if (padding[0])
			output.push(border[3] || EMPTY, repeated(padding[0], innerWidth), border[1] || EMPTY, EOL)

		// Constrain each line within the size
		lines.forEach((line) => {
			output.push(border[3] || EMPTY, padding[3] || EMPTY)

			const cropped = line.substring(0, lineWidth)
			output.push(cropped)
			if (cropped.length < lineWidth)
				output.push(repeated(SPACE, lineWidth - cropped.length))

			output.push(padding[1] || EMPTY, border[1] || EMPTY, EOL)
		})

		if (padding[2])
			output.push(border[3] || EMPTY, repeated(padding[2], innerWidth), border[1] || EMPTY, EOL)
		if (border[2])
			output.push(corner[3] || border[3] || EMPTY, repeated(border[2], innerWidth), corner[2] || SPACE, EOL)

		return output.filter((s) => s.length > 0).join('')
	}

	addKey(name: string, handler: KeypressHandler) {
		if (! this.keyHandler)
			this.keyHandler = {}
		this.keyHandler[name] = handler.bind(this)
		return this
	}

	removeKey(name: string) {
		if (this.keyHandler)
			delete this.keyHandler[name]
		return this
	}

	getKeyHandler(): KeyHandler | null {
		if (this.cacheKeyHandler)
			return this.cacheKeyHandler

		const mergeHandler = (lf: LogFragment, base: KeyHandler | null) => {
			const h = lf.getKeyHandler()
			return (h != null) ? (base != null ? Object.assign(base, h) : h) : base
		}

		let handler: KeyHandler | null = this.keyHandler || null
		if (this.content.length > 0) {
			this.content.forEach((content) => {
				if (Array.isArray(content))
					content.forEach((c) => {
						if (c instanceof LogFragment)
							handler = mergeHandler(c, handler)
					})
				else if (content instanceof LogFragment)
					handler = mergeHandler(content, handler)
			})
		}
		return this.cacheKeyHandler = handler
	}

	/**
	 * @func 	toString
	 * @desc 	Converts the log fragment to an output string
	 */
	toString(): string {
		const output: Array<string> = []
		this.addANSI(output)
		this.content.forEach((content) => {
			if (Array.isArray(content))
				output.push.apply(output, content.map((c) => c.toString()))
			else
				output.push(content.toString())
		})
		this.terminateANSI(output)
		return output.join('')
	}

	// Create the ANSI escape character
	private addANSI(output: Array<string>) {
		if (this.fgColor != null) {
			output.push('\u001b[', this.fgColor.toString(), this.fgBright ? ';1' : '', 'm')
		}
		if (this.bgColor != null) {
			output.push('\u001b[', this.bgColor.toString(), this.bgBright ? ';1' : '', 'm')
		}
		// if (this.fgColor != null || this.bgColor != null) {
		// 	output.push('\u001b[',
		// 		this.fgColor != null ? (this.fgColor + (this.fgBright ? 60 : 0)).toString() : '',
		// 		this.bgColor != null ? ';' : '',
		// 		this.bgColor != null ? (this.bgColor + (this.bgBright ? 60 : 0)).toString() : '',
		// 	'm')
		// }
	}

	private terminateANSI(output: Array<string>) {
		if (this.fgColor != null || this.bgColor != null)
			output.push('\u001b[0m')
		// if (this.bgColor != null)
			// output.push('\u001b[0m')
	}

	repeat(str: string, times: number) {
		this.content.push(repeated(str, times))
		return this
	}

	newLine() {
		this.content.push('\n')
		return this
	}

	clear() {
		this.content = []
	}

	private setColor(fg: number, bright?: boolean) {
		this.fgColor = fg
		this.fgBright = bright
		return this
	}

	private setBackground(bg: number, bright?: boolean) {
		this.bgColor = bg
		this.bgBright = bright
		return this
	}

	bright() {
		this.fgBright = true
		return this
	}

	brightBg() {
		this.bgBright = true
		return this
	}

	red() { 			return this.setColor(31); 		}
	brightRed() { 		return this.setColor(31, true); }
	green() { 			return this.setColor(32); 		}
	brightGreen() { 	return this.setColor(32, true); }
	yellow() { 			return this.setColor(33); 		}
	brightYellow() { 	return this.setColor(33, true); }
	blue() { 			return this.setColor(34); 		}
	brightBlue() { 		return this.setColor(34, true); }
	magenta() { 		return this.setColor(35); 		}
	brightMagenta() { 	return this.setColor(35, true); }
	cyan() { 			return this.setColor(36); 		}
	brightCyan() { 		return this.setColor(36, true); }
	white() { 			return this.setColor(37); 		}
	brightWhite() { 	return this.setColor(37, true); }

	bgRed() { 			return this.setBackground(41); 		 }
	bgBrightRed() { 	return this.setBackground(41, true); }
	bgGreen() { 		return this.setBackground(42); 		 }
	bgBrightGreen() { 	return this.setBackground(42, true); }
	bgYellow() { 		return this.setBackground(43); 		 }
	bgBrightYellow() { 	return this.setBackground(43, true); }
	bgBlue() { 			return this.setBackground(44); 		 }
	bgBrightBlue() { 	return this.setBackground(44, true); }
	bgMagenta() { 		return this.setBackground(45); 		 }
	bgBrightMagenta() { return this.setBackground(45, true); }
	bgCyan() { 			return this.setBackground(46); 		 }
	bgBrightCyan() { 	return this.setBackground(46, true); }
	bgWhite() { 		return this.setBackground(47); 		 }
	bgBrightWhite() { 	return this.setBackground(47, true); }


}

class LogText extends LogFragment {
	align?: 'left' | 'center' | 'right'
	alignWidth?: number

	constructor() {
		super()
	}

	text(content: LogContent) {
		this.clear()
		return super.text(content)
	}

	setAlign(align: 'left' | 'center' | 'right', width: number) {
		this.align = align
		this.alignWidth = width
		return this
	}

	alignLeft(width: number) {
		return this.setAlign('left', width)
	}

	alignCenter(width: number) {
		return this.setAlign('center', width)
	}

	alignRight(width: number) {
		return this.setAlign('right', width)
	}

	private trimContent(amount: number) {
		let trim = amount
		for (let i = this.content.length - 1 ; i >= 0 && trim > 0 ; i--) {
			const str = this.content[i]
			if (str instanceof LogText) {
				trim -= str.trimContent(trim)
			}
			else if (typeof str === 'string') {
				if (str.length < trim) {
					this.content.splice(i, 1)
					trim -= str.length
				}
				else {
					this.content[i] = str.substring(0, trim)
					return amount
				}
			}
		}
		return amount - trim
	}

	toString() {
		let str = super.toString()
		// Align the text without ANSI escapes
		if (this.align && this.alignWidth) {
			const raw = str.replace(ANSI_REGEX, '')

			// Already at max width
			if (raw.length > this.alignWidth) {
				this.trimContent(raw.length - this.alignWidth)
				return super.toString()
			}

			// Add a repeated sequence of space padding
			const padding = this.alignWidth - raw.length
			if (padding <= 0)
				return str
			else if (this.align === 'left')
				this.content.push(repeated(SPACE, padding))
			else if (this.align === 'right')
				this.content.unshift(repeated(SPACE, padding))
			else if (this.align === 'center') {
				this.content.unshift(repeated(SPACE, Math.floor(padding / 2)))
				this.content.push(repeated(SPACE, Math.ceil(padding / 2)))
			}
			return super.toString()
		}

		return str
	}

}
