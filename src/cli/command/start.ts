import {
	LifxClient
} from '../..'

import LifxCommand from '../command'

export default class LifxStartCommand extends LifxCommand {

	constructor() {
		super()
	}

	async execute() {
		const client = new LifxClient()
		await client.discover()
		client.monitor(10000)
		client.startServer()
		client.log.interactive()
	}

}
