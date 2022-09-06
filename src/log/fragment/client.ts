import {
	LifxClient
} from '../..'

import {
	LogFragment
} from '.'

import {
	Keypress
} from '../interface'

export default class LogClientState extends LogFragment {
	client: LifxClient

	// Device list scroll position
	scroll = {
		device: -1,
		page: 0
	}
	markers: Array<LogFragment>

	constructor(client: LifxClient) {
		super()
		this.client = client

		// console.clear()
		// console.log('┏━━━━━━━━━━━━━━━━━')
		// console.log('┃')
		// console.log('┣━━━━━━━━━━━━━━━━━')
		// console.log('selected: ' + this.selected)
		// console.log('┗━━━━━━━━━━━━━━━━━')

		this.addKey('up', this.updateScroll)
		this.addKey('down', this.updateScroll)
	}

	update() {
		const state = this.client.getState()

		this.clear()
		const status = this.addText('client on ' + state.id)
		this.newLine()
		if (state.alive)
			status.green().text('client connected')
		else
			status.red()

		if (state.device)
			state.device.forEach((device, index) => {
				const line = this.addLine([
					device.label ? device.label.label : '',
					' (', device.ip, ')'
				])

				if (index === this.scroll.device)
					line.white().bgBlue()
			})
	}

	async updateScroll(key: Keypress) {
		const change = (key.name == 'up') ? -1 : 1
		this.scroll.device = Math.max(0, this.scroll.device + change)
	}



}
