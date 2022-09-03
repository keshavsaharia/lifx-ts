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
		client.startServer()
		await client.discover()
	}

}
