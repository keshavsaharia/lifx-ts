import {
	UIPage,
	UIManageDeviceTable
} from '../..'

import {
	ClientState,
	DeviceState,
	DeviceGroup
} from '../../../../interface'

export default class UIGroupCreateView extends UIPage {

	constructor(client: ClientState, group?: string, location?: boolean) {
		super()

		this.add(new UIManageDeviceTable(client, group, location))
	}

}
