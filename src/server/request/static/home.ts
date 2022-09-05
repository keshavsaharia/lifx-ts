import LifxRequest from '../request'

import {
	UIHomeView
} from '../../ui'

export default class LifxHomeRequest extends LifxRequest<any> {

	async respond() {
		return this.render(
			new UIHomeView(this.client.getState())
		)
	}

}
