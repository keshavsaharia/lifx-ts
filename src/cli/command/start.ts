import {
	LifxClient
} from '../..'

import LifxCommand from '../command'

import {
	PORT_OPTIONS,
	CLIENT_FLAGS,
	CACHE_OPTION
} from '../option'

export default class LifxStartCommand extends LifxCommand {

	constructor() {
		super({
			option: [
				...PORT_OPTIONS,
				...CLIENT_FLAGS,
				CACHE_OPTION
			]
		})
	}

	async execute() {
		const client = new LifxClient()
		if (this.getFlag('interactive'))
			client.log.interactive()

		await client.start(this.getNumber('port'))
		await client.discover(true)
		client.monitor(10000)
		client.startServer()
		
		client.onLoad((device) => {
			device.monitor(['power', 'color', 'light'])
		})
	}

}
