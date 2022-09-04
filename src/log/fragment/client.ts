import {
	ClientState
} from '../../interface'

import {
	LogFragment
} from '.'

export default class LogClientState extends LogFragment {
	state: ClientState

	constructor(state: ClientState) {
		super()
		this.state = state

		const status = this.addText('client on ' + state.id)
		if (state.alive)
			status.green().text('client connected')
		else
			status.red()
	}

	update(state: ClientState) {
		this.state = state
	}



}
