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
		client.log.interactive()

		await client.discover()
		client.monitor(10000)
		client.startServer()

		client.onConnect((device) => device.load())
		client.onLoad((device) => {
			device.monitor(['power', 'color', 'light'])
		})
	}

}
