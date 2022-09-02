import {
	UIPage
} from '..'

import {
	ClientState
} from '../../../interface'

export default class UIErrorPage extends UIPage {
	client: ClientState

	constructor(client: ClientState) {
		super()
	}

}
