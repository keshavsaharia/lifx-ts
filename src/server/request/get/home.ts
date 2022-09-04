import LifxRequest from '../request'

import {
	UIHomeView
} from '../../ui'

export default class HomeRequest extends LifxRequest {



	async respond() {
		const view = new UIHomeView(this.client.getState())
		return {}
	}

}
