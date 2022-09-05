import {
	LifxClient
} from '../..'

import {
	LogFragment
} from '.'

import {
	Keypress
} from '../interface'

import LogEmitter from '../emitter'

export default class LogClientState extends LogFragment {
	client: LifxClient

	// Device list scroll position
	scroll = {
		device: 0,
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
		this.clear()
		const state = this.client.getState()
		const status = this.addText('client on ' + state.id)
		if (state.alive)
			status.green().text('client connected')
		else
			status.red()

		if (state.device)
			state.device.forEach((device, index) => {
				this.addLine([
					index == this.scroll.device ? ' > ' : '   ',
					device.label ? device.label.label : '',
					' (', device.ip, ')'
				])
			})
	}

	async updateScroll(key: Keypress) {
		const change = (key.name == 'up') ? -1 : 1
		const nextIndex = this.scroll.device + change
		if (nextIndex >= 0 && nextIndex < this.client.getDevices().length) {
			this.scroll.device = nextIndex
		}
	}



}
