import {
	LogContent,
	LogConstraint,
	KeyHandler,
	Keypress
} from '../interface'

import {
	repeated
} from '../util'

const SPACE = ' '
const EOL = '\n'
const EMPTY = ''

export default class LogFragment {
	// Content in this fragment, and a flag for whether it changes
	content: Array<LogContent>
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
		this.content = args
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
		this.content.push(content)
		return this
	}

	addText(content?: LogContent) {
		const text = new LogText()
		if (content)
			text.add(content)
		this.content.push(text)
		return text
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

	addKey(name: string, handler: (key: Keypress) => Promise<any>) {
		if (! this.keyHandler)
			this.keyHandler = {}
		this.keyHandler[name] = handler
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
					content.forEach((c) => (handler = mergeHandler(c, handler)))
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
			else if (content instanceof LogFragment)
				output.push(content.toString())
			else
				output.push(content)
		})
		this.terminateANSI(output)
		return output.join('')
	}

	// Create the ANSI escape character
	private addANSI(output: Array<string>) {
		if (this.fgColor != null || this.bgColor != null) {
			output.push('\u001b[',
				(this.fgColor != null ? '' + (this.fgColor + (this.fgBright ? 60 : 0)) : ''),
				this.bgColor != null ? ';' : '',
				this.bgColor != null ? '' + (this.bgColor + (this.bgBright ? 60 : 0)) : '',
			'm')
		}
	}

	private terminateANSI(output: Array<string>) {
		if (this.fgColor != null || this.bgColor != null)
			output.push('\x1b[0m')
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

	bgRed() { 			return this.setBackground(31); 		 }
	bgBrightRed() { 	return this.setBackground(31, true); }
	bgGreen() { 		return this.setBackground(32); 		 }
	bgBrightGreen() { 	return this.setBackground(32, true); }
	bgYellow() { 		return this.setBackground(33); 		 }
	bgBrightYellow() { 	return this.setBackground(33, true); }
	bgBlue() { 			return this.setBackground(34); 		 }
	bgBrightBlue() { 	return this.setBackground(34, true); }
	bgMagenta() { 		return this.setBackground(35); 		 }
	bgBrightMagenta() { return this.setBackground(35, true); }
	bgCyan() { 			return this.setBackground(36); 		 }
	bgBrightCyan() { 	return this.setBackground(36, true); }
	bgWhite() { 		return this.setBackground(37); 		 }
	bgBrightWhite() { 	return this.setBackground(37, true); }


}

class LogText extends LogFragment {

	constructor() {
		super()
	}

	text(content: LogContent) {
		this.clear()
		return super.text(content)
	}

}
