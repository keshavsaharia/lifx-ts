import {
	LogContent
} from '../interface'

export default class LogFragment {
	content: Array<LogContent>
	fg?: number
	fgBright?: boolean
	bg?: number
	bgBright?: boolean

	constructor(...args: Array<LogContent>) {
		this.content = args
	}

	repeat(sequence: string, times: number) {
		this.content.push(new Array(times).fill(sequence).join(''))
		return this
	}

	newLine() {
		this.content.push('\n')
		return this
	}

	renderIn(constraint: LogConstraint) {
		const lines = this.render().split('\n')
		const border = constraint.border || []
		let padding = constraint.padding || [0, 0, 0, 0]
		if (padding.length == 2)
			padding = padding.concat(padding)

		// Calculate border width from top, right, bottom, left array
		const borderWidth = (border[1] || '').length + (border[3] || '').length

		const output: Array<string> = []
		lines.forEach((line) => {
			const cropped = line.substring(0, constraint.width - borderWidth)
			if (border[1] != null)
				output.push(border[1])

			output.push(cropped)

			if (border[3] != null)
				output.push(border[3])
		})
		if (constraint.border) {

		}
	}

	render(): string {
		const output: Array<string> = []
		this.addANSI(output)
		this.content.forEach((content) => {
			if (Array.isArray(content))
				output.push.apply(output, content.map((c) => c.render()))
			else if (content instanceof LogFragment)
				output.push(content.render())
			else
				output.push(content)
		})
		this.terminateANSI(output)
		return output.join('')
	}

	private addANSI(output: Array<string>) {
		if (this.fg != null || this.bg != null) {
			output.push('\033[',
				(this.fg != null ? '' + (this.fg + (this.fgBright ? 60 : 0)) : ''),
				this.bg != null ? ';' : '',
				this.bg != null ? '' + (this.bg + (this.bgBright ? 60 : 0)) : '',
			'm')
		}
	}

	private terminateANSI(output: Array<string>) {
		if (this.fg != null || this.bg != null)
			output.push('\x1b[0m')
	}

	private setColor(fg: number, bright?: boolean) {
		this.fg = fg
		this.fgBright = bright
		return this
	}

	private setBackground(bg: number, bright?: boolean) {
		this.bg = bg
		this.bgBright = bright
		return this
	}

	bright() {
		this.fgBright = true
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

	add(content: LogContent) {
		this.content.push(content)
		return this
	}

}
