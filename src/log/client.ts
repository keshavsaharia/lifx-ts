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
	test: Array<Keypress>

	constructor(client: LifxClient) {
		super()
		this.client = client
		this.test = []
	}

	render(): KeyHandler {
		// console.clear()
		console.log('┏━━━━━━━━━━━━━━━━━')
		console.log('┃')
		console.log('┣━━━━━━━━━━━━━━━━━')
		console.log('┗━━━━━━━━━━━━━━━━━')

		return {
			a: async (k) => {
				this.test.push(k)
			},
			b: async (k) => {
				this.test.push(k)
			}
		}
	}

	startClient(alive?: boolean) {
		console.log('Starting client', alive)
	}

	stopClient(alive?: boolean) {
		console.log('Stopping client')
	}

	alive() {
		// this.message(this.red('hey'))
	}
}
