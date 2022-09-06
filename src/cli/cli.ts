import LifxStartCommand from './command/start'

import LifxRouter from './router'

import {
	PORT_OPTIONS,
	CLIENT_FLAGS,
	CACHE_OPTION
} from './option'

export default class LifxCLI extends LifxRouter {

	constructor() {
		super({
			child: {
				start: LifxStartCommand
			},
			option: [
				...PORT_OPTIONS,
				...CLIENT_FLAGS,
				CACHE_OPTION
			]
		})
	}

}
