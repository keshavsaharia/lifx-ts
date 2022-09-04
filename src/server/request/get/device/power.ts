import LifxRequest from '../../request'

export default class GetDevicePowerRequest extends LifxRequest {

	async respond() {
		return this.resource('/favicon/' + this.shiftPath())
	}

}
