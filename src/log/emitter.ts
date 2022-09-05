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
	keypressDecoder: StringDecoder

	refreshTimeout?: NodeJS.Timeout
	lastRefresh: number
	exiting: boolean = false

	constructor() {
		this.lastRefresh = Date.now()
		this.keypressDecoder = new StringDecoder('utf8')
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

	private async refresh(): Promise<Keypress | null> {
		if (this.exiting || ! this.interactiveMode)
			return null
		this.lastRefresh = Date.now()

		console.clear()
		return this.getNextKeypress(this.render())
	}

	protected triggerRefresh() {

		process.nextTick(function() {
			const now = Date.now()
			const sinceLastRefresh = now - this.lastRefresh
			if (sinceLastRefresh >= REFRESH_RATE)
				this.refresh()
			else
				this.refreshTimeout = setTimeout(this.refresh.bind(this), REFRESH_RATE - sinceLastRefresh)
		}.bind(this))
	}

	private async getNextKeypress(map?: KeyHandler | null): Promise<Keypress | null> {
		while (true) {
			try {
				const key = await this.getKeypress()
				console.log('got key', key)
				if (key) {
					// If the keypress is an escape sequence like Ctrl+C or Ctrl+Q
					if (key.exit)
						return null
					else if (map) {
						if (key.name && map[key.name]) {
							await map[key.name].call(this, key)
							this.triggerRefresh()
							return key
						}
						else {
							console.log('no handler', key.name)
						}
					}
					// If there is no keymap, ignore keys until an exit key is reached
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
		this.interruptRefresh()
		this.interruptKeypress()
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
			this.keypressInterrupt = undefined
		}
		if (this.keypressHandler) {
			process.stdin.removeListener('data', this.keypressHandler)
			this.keypressHandler = undefined
		}
	}

	async getKeypress(): Promise<Keypress | null> {
		this.interruptKeypress()

		const key = await new Promise((resolve: (char: Keypress | null) => any) => {
			this.keypressInterrupt = function() {
				process.stdin.removeListener('data', handler)
				resolve(null)
			}.bind(this);

			const handler = function (data: Buffer) {
				const char = this.keypressDecoder.write(data)
				if (char) {
					const key = getKey(char)
					process.stdin.removeListener('data', handler)
					this.keypressHandler = this.keypressInterrupt = undefined
					resolve(key)
				}
			}.bind(this)

			process.stdin.on('data', this.keypressHandler = handler)
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
