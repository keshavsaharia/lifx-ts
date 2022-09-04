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
		client.monitor(1000)
		client.startServer()

	}

}
