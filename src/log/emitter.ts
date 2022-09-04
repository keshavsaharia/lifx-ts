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

	charHandler?: (data: Buffer) => any
	charInterrupt?: () => any
	refreshTimeout?: NodeJS.Timeout
	lastRefresh: number
	exiting: boolean = false

	constructor() {
		this.lastRefresh = Date.now()
	}

	interactive() {
		this.interactiveMode = true
		process.stdin.setRawMode(true)
		this.refresh()
	}

	/**
	 * Render an interactive terminal
	 */
	abstract render(): KeyHandler | null

	protected async refresh(): Promise<Keypress | null> {
		if (this.exiting || ! this.interactiveMode)
			return null
		this.lastRefresh = Date.now()

		console.clear()
		return this.getNextKeypress(this.render())
	}

	private triggerRefresh(content?: LogContent) {
		if (! this.interactiveMode) {

			return
		}
		if (this.refreshTimeout)
			clearTimeout(this.refreshTimeout)

		process.nextTick(function() {
			const now = Date.now()
			const sinceLastRefresh = now - this.lastRefresh
			if (sinceLastRefresh >= REFRESH_RATE)
				this.refresh()
			else
				this.refreshTimeout = setTimeout(this.refresh.bind(this), REFRESH_RATE)
		}.bind(this))
	}

	private async getNextKeypress(map?: KeyHandler | null): Promise<Keypress | null> {
		if (map == null)
			return null

		while (true) {
			try {
				const key = await this.getKeypress()
				if (key) {
					if (key.exit)
						return null
					else if (key.name && map[key.name]) {
						await map[key.name].call(this, key)
						this.triggerRefresh()
						return key
					}
					else {
						this.triggerRefresh()
						return null
					}
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
		if (this.refreshTimeout)
			clearTimeout(this.refreshTimeout)

		if (this.charInterrupt) {
			this.charInterrupt()
			this.charInterrupt = undefined
		}
		if (this.charHandler) {
			process.stdin.removeListener('data', this.charHandler)
			this.charHandler = undefined
		}
	}

	async getKeypress(): Promise<Keypress | null> {
		if (this.charHandler)
			process.stdin.removeListener('data', this.charHandler)

		const key = await new Promise((resolve: (char: Keypress | null) => any) => {
			const keypress = new StringDecoder('utf8')

			const interrupt = function() {
				process.stdin.removeListener('data', handler)
				resolve(null)
			}.bind(this);

			const handler = function (data: Buffer) {
				const char = keypress.write(data)
				if (char) {
					const key = getKey(char)
					process.stdin.removeListener('data', handler)
					this.charHandler = this.charInterrupt = undefined
					resolve(key)
				}
			}.bind(this)

			this.charHandler = handler
			this.charInterrupt = interrupt
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

}
