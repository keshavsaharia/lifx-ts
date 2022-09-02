import {
	LifxClient
} from '..'

import LogEmitter from './emitter'

export default class ClientLogEmitter extends LogEmitter {
	client: LifxClient

	constructor(client: LifxClient) {
		super()
		this.client = client
	}

	starting() {

	}

	start() {

	}

	stop() {

	}
}
