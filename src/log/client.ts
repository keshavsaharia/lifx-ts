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

	logState: LogClientState

	selected = 1

	constructor(client: LifxClient) {
		super()
		this.client = client
		// Initialize interactive logger
		this.logState = new LogClientState(client)
	}

	render(): KeyHandler | null {
		this.logState.update()

		// Render client state
		console.log(this.logState.toString())
		return this.logState.getKeyHandler()
	}

	startClient(alive?: boolean) {
		this.out('Client starting')
		// if (alive) {
		// 	this.interrupt()
		// 	this.triggerRefresh()
		// }
	}

	stopClient(alive?: boolean) {
		this.out('Client stopping')
	}

	startServer(alive?: boolean) {
		this.out('Server starting')
	}

	stopServer(alive?: boolean) {
		this.out('Server stopping')
	}

	alive() {
		// this.message(this.red('hey'))
	}
}
