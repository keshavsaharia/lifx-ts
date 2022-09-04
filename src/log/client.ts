import {
	LifxClient
} from '..'

import {
	Keypress,
	KeyHandler
} from './interface'

import LogEmitter from './emitter'

import {
	LogClientState
} from './fragment'

export default class ClientLogEmitter extends LogEmitter {
	client: LifxClient

	logState?: LogClientState

	selected = 1

	constructor(client: LifxClient) {
		super()
		this.client = client
	}

	render(): KeyHandler | null {
		// Initialize interactive logger
		if (! this.logState)
			this.logState = new LogClientState(this.client.getState())
		else
			this.logState.update(this.client.getState())

		// Render client state
		console.log(this.logState.render({
			width: 80
		}))
		// console.clear()
		// console.log('┏━━━━━━━━━━━━━━━━━')
		// console.log('┃')
		// console.log('┣━━━━━━━━━━━━━━━━━')
		// console.log('selected: ' + this.selected)
		// console.log('┗━━━━━━━━━━━━━━━━━')

		return this.logState.getKeyHandler()
	}

	startClient(alive?: boolean) {
		console.log('Starting client', alive)
		if (alive) {
			this.interrupt()
			this.triggerRefresh()
		}
	}

	stopClient(alive?: boolean) {
		console.log('Stopping client')
	}

	startServer(alive?: boolean) {
		console.log('Starting server', alive)
	}

	stopServer(alive?: boolean) {
		console.log('Stopping server')
	}

	alive() {
		// this.message(this.red('hey'))
	}
}
