import {
	LifxClient
} from '..'

import {
	Keypress,
	KeyHandler
} from './interface'

import LogEmitter from './emitter'

export default class ClientLogEmitter extends LogEmitter {
	client: LifxClient

	selected = 1

	constructor(client: LifxClient) {
		super()
		this.client = client
	}

	render(): KeyHandler {
		// console.clear()
		console.log('┏━━━━━━━━━━━━━━━━━')
		console.log('┃')
		console.log('┣━━━━━━━━━━━━━━━━━')
		console.log('selected: ' + this.selected)
		console.log('┗━━━━━━━━━━━━━━━━━')

		return {
			up: async (k) => {
				this.selected++
			},
			down: async (k) => {
				this.selected--
			}
		}
	}

	startClient(alive?: boolean) {
		console.log('Starting client', alive)
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
