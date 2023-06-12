import {
	LifxClient
} from '..'

import {
	Keypress,
	KeyHandler
} from './interface'

import {
	DeviceState
} from '../interface'

import LogEmitter from './emitter'
import LogView from './ui/view'

import {
	LogClientState
} from './fragment'

export default class ClientLogEmitter extends LogEmitter {

	client: LifxClient

	logState: LogClientState
	testView: LogView

	selected = 1

	constructor(client: LifxClient) {
		super()
		this.client = client
		// Initialize interactive logger
		this.logState = new LogClientState(client)

		this.testView = new LogView({
			width: 50,
			height: 20
		})

		this.testView.add('Hello world!')
	}

	render(): KeyHandler | null {
		// this.logState.update()
		this.testView.log()

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

	addDevice(device: DeviceState) {
        this.out('Added device ' + device.ip)
    }

	loadDevice(device: DeviceState) {
        this.out('Loaded device ' + device.ip)
    }

	removeDevice(device: DeviceState) {
		this.out('Disconnected from device ' + device.ip)
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
