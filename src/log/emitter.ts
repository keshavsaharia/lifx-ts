import { StringDecoder } from 'string_decoder'

import {
	getKey
} from './util'

import {
	Keypress,
	KeyHandler,
	LogContent
} from './interface'

import {
	REFRESH_RATE
} from './constant'

export default abstract class LogEmitter {

	// 0 - no console output
	// 1 - only client state logs
	// 2 - client and device connectivity logs
	// 3 - all client and device state updates
	// 4 - all client, device, and network events
	logLevel: number = 2
	private interactiveMode: boolean = false

	keypressHandler?: (data: Buffer) => any
	keypressInterrupt?: () => any
	// keypressDecoder: StringDecoder

	refreshTimeout?: NodeJS.Timeout
	lastRefresh: number
	exiting: boolean = false

	constructor() {
		this.lastRefresh = Date.now()
		// this.keypressDecoder = new StringDecoder('utf8')
	}

	out(content?: LogContent | number | boolean) {
		if (this.interactiveMode)
			this.triggerRefresh(true)
		else if (Array.isArray(content))
			console.log(content.map((c) => c.toString()).join(''))
		else if (content != null)
			console.log(content.toString())
	}

	//
	// Interactive log output (default)
	//

	interactive() {
		this.interactiveMode = true
		process.stdin.setRawMode(true)
		this.refresh()
	}

	/**
	 * Render an interactive terminal
	 */
	abstract render(): KeyHandler | null

	private async refresh(interruptKeypress?: boolean): Promise<Keypress | null> {
		if (this.exiting || ! this.interactiveMode)
			return null
		this.lastRefresh = Date.now()

		// console.clear()
		const map = this.render()
		if (interruptKeypress || ! this.keypressHandler)
			return this.getNextKeypress(map)
		return null
	}

	private triggerRefresh(interruptKeypress: boolean = false) {
		this.interruptRefresh()

		process.nextTick(function() {
			const now = Date.now()
			const sinceLastRefresh = now - this.lastRefresh
			if (sinceLastRefresh >= REFRESH_RATE) {
				if (interruptKeypress)
					this.interruptKeypress()
				this.refresh(interruptKeypress)
			}
			else
				this.refreshTimeout = setTimeout(function() {
					if (interruptKeypress)
						this.interruptKeypress()
					this.refresh(interruptKeypress)
				}.bind(this), REFRESH_RATE - sinceLastRefresh)
		}.bind(this, interruptKeypress))
	}

	private async getNextKeypress(map?: KeyHandler | null): Promise<Keypress | null> {
		while (true) {
			try {
				const key = await this.getKeypress()
				if (key) {
					// If the keypress is an escape sequence like Ctrl+C or Ctrl+Q
					if (key.exit) {
						console.clear()
						return null
					}
					else if (map) {
						if (key.name && map[key.name]) {
							try {
								await map[key.name](key, this)
								this.triggerRefresh()
								return key
							}
							catch (error) {
								return null
							}
						}
						// else this.triggerRefresh()
					}
					// If there is no keymap, ignore keys until an exit key is reached
					// else this.triggerRefresh()
				}
				else {
					// console.log('no key')
					this.triggerRefresh()
				}
			}
			catch (error) {
				console.log('error', error)
				return null
			}
		}
	}

	interrupt() {
		if (this.exiting)
			return

		this.exiting = true
		if (this.interactiveMode) {
			this.interruptRefresh()
			this.interruptKeypress()
			console.clear()
		}

	}

	interruptRefresh() {
		if (this.refreshTimeout) {
			clearTimeout(this.refreshTimeout)
			this.refreshTimeout = undefined
		}
	}

	interruptKeypress() {
		if (this.keypressInterrupt) {
			this.keypressInterrupt()
		}
		else if (this.keypressHandler) {
			process.stdin.removeListener('data', this.keypressHandler)
			this.keypressHandler = undefined
		}
	}

	async getKeypress(): Promise<Keypress | null> {
		// if (this.keypressInterrupt) {
		// 	this.keypressInterrupt()
		// }
		const key = await new Promise((resolve: (char: Keypress | null) => any) => {
			const decoder = new StringDecoder('utf8')
			const handler = function (data: Buffer) {
				const char = decoder.write(data)
				if (char) {
					const key = getKey(char)
					if (key) {
						interrupt()
						resolve(key)
					}
				}
			}.bind(this)

			const interrupt = function() {
				this.keypressInterrupt = this.keypressHandler = undefined
				process.stdin.removeListener('data', handler)
			}.bind(this)

			this.keypressInterrupt = function() {
				interrupt()
				resolve(null)
			}.bind(this);

			this.keypressHandler = handler
			process.stdin.on('data', handler)
		})

		if (key) {
			if (key.exit) {
				process.kill(process.pid, 'SIGINT')
				process.kill(process.pid, 'SIGTERM')
			}
			return key
		}
		return null
	}

	// Standard log output functions

	output(content: LogContent) {
		if (Array.isArray(content))
			content.forEach((fragment) => console.log(fragment.toString()))
		else
			console.log(content.toString())
	}
}
