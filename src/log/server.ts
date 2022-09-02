import {
	LifxServer,
	LifxClient
} from '..'

import LogEmitter from './emitter'

export default class ServerLogEmitter extends LogEmitter {
	server: LifxServer
	client: LifxClient

	constructor(server: LifxServer, client: LifxClient) {
		super()
		this.server = server
		this.client = client
	}

	start() {

	}

	stop() {

	}

}
