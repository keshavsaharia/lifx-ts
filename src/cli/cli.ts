import LifxStartCommand from './command/start'

import LifxRouter from './router'

export default class LifxCLI extends LifxRouter {

	constructor() {
		super({
			child: {
				start: LifxStartCommand
			},
			option: [
				{
					pattern: ['-p', '--port'],
					key: 'port',
					type: 'number',
					name: 'Port',
					description: 'Port to start UDP/TCP sockets on'
				},
				{
					pattern: ['-s', '--serve'],
					name: 'Server port',
					description: 'Port to start application server on',
					type: 'number',
					key: 'server_port'
				}
			]
		})
	}

}
