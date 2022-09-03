import { StringDecoder } from 'string_decoder'

import {
	getKey
} from './util'

import {
	Keypress,
	KeyHandler
} from './interface'

export default abstract class LogEmitter {

	// 0 - no console output
	// 1 - only client state logs
	// 2 - client and device connectivity logs
	// 3 - all client and device state updates
	// 4 - all client, device, and network events
	logLevel: number = 2
	private logNetworkEvent: Set<string>
	private logInteractive: boolean = false

	charHandler?: (data: Buffer) => any
	charInterrupt?: () => any
	refreshTimeout?: NodeJS.Timeout
	exiting: boolean = false

	constructor() {

	}

	interactive() {
		this.refresh()
	}

	protected refresh() {
		if (this.exiting)
			return
		// console.clear()
		const map = this.render()

		if (map)
			return this.refreshKeypress(map)
	}

	private async refreshKeypress(map: KeyHandler) {
		try {
			const key = await this.getChar()
			if (this.exiting)
				return null
			else if (key && key.name && ! key.exit && map[key.name]) {
				await map[key.name](key)
				this.startRefreshTimer()
				return key
			}
			else if (key && ! key.exit) {
				this.startRefreshTimer()
				return null
			}
		}
		catch (error) {
			return null
		}
	}

	private startRefreshTimer() {
		if (this.refreshTimeout)
			clearTimeout(this.refreshTimeout)
		this.refreshTimeout = setTimeout(() => {
			this.refresh()
		}, 50)
	}

	abstract render(): KeyHandler | null

	interrupt() {
		if (this.exiting)
			return

		this.exiting = true
		if (this.refreshTimeout)
			clearTimeout(this.refreshTimeout)
		if (this.charHandler) {
			process.stdin.setRawMode(false)
			process.stdin.removeListener('data', this.charHandler)
			this.charHandler = undefined

			if (this.charInterrupt) {
				this.charInterrupt()
				this.charInterrupt = undefined
			}
		}
		console.log('interrupt ended')
		process.stdin.end()
	}

	async getChar(): Promise<Keypress | null> {
		console.log('Starting new key')

		const key = await new Promise((resolve: (char: Keypress) => any) => {
			const keypress = new StringDecoder('utf8')
			if (this.charHandler)
				process.stdin.removeListener('data', this.charHandler)

			this.charHandler = (data: Buffer) => {
				const char = keypress.write(data)
				if (char) {
					const key = getKey(char)
					if (key) {
						if (this.charHandler) {
							process.stdin.setRawMode(false)
							process.stdin.removeListener('data', this.charHandler)
						}
						this.charInterrupt = undefined
						resolve(key)
					}
					else resolve({})
				}
			};
			this.charInterrupt = () => {
				process.stdin.setRawMode(false)
				resolve({})
			}
			process.stdin.setRawMode(true)
			process.stdin.on('data', this.charHandler.bind(this))
		})

		if (key) {
			if (key.exit) {
				console.log('Exiting on key')
				process.kill(process.pid, 'SIGINT')
				process.kill(process.pid, 'SIGTERM')
				console.log('sent signals')
			}
			return key
		}
		return null
	}

	protected red(text: any) {
		return this.color(31, null, text)
	}

	private ansi(fg: number | null = null, bg: number | null = null): string {
		return ['\x1b[',
			(fg == null && bg == null) ? '0' : '',
			(fg != null ? fg : ''),
			bg != null ? ';' : '',
			bg != null ? bg : '',
		'm'].join('')
	}

	private color(fg: number | null, bg: number | null, text: any) {
		if (text != null)
			return [this.ansi(fg, bg), text.toString(), this.ansi()].join('')
		return ''
	}

	// private logEvent(event: string, device?: LifxDevice | number, level?: number) {
	// 	const func = Log.client[event]
	// 	if (typeof device === 'number') {
	// 		level = device
	// 		device = undefined
	// 	}
	// 	if (func && (level == null || level <= this.logLevel))
	// 		this.log(func(this, device))
	// 	return this
	// }
	//
	message(message: string) {
		console.log(message)
	}

}
