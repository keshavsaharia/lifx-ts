import {
	UIPage
} from '..'

import {
	ClientState
} from '../../../interface'

export default class UIHomeView extends UIPage {
	client: ClientState

	constructor(client: ClientState) {
		super()
		this.addTitle('lifx')
	}

}
