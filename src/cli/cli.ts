import LifxStartCommand from './command/start'

export default class LifxCLI {

	constructor() {

	}

	async parse(args: Array<string>) {
		if (args.length == 0)
			return console.log('help')

		const command = args[0]
		if (command == 'start') {
			// start client/server
			console.log('starting server')
		}
	}

}
