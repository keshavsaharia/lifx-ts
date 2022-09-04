import LifxRequest from '../request'

export default class LifxDevicePowerRequest extends LifxRequest<any> {

	async respond() {
		return this.resource('/favicon/' + this.shiftPath())
	}

}
