import {
	LifxClient
} from '../..'

import {
	Request,
	RequestInstance,
	Response
} from './interface'

import {
	UIElement
} from '../ui'

import {
	InvalidParameter,
	ResourceNotFound
} from '../error'

import {
	getStaticResource,
	getMimeType
} from '../ui/util'

export default abstract class LifxRequest<Param> implements RequestInstance<Param> {
	protected client: LifxClient

	constructor(client: LifxClient) {
		this.client = client
	}

	parameter(id: string): Param {
		throw InvalidParameter
	}

	abstract respond(request: Request, param?: Param): Promise<Response>

	protected render(element: UIElement): Response {
		return {
			type: 'text/html',
			body: element.render()
		}
	}

	protected resource(resourcePath: string): Response {
		const resource = getStaticResource(resourcePath)
		if (! resource)
			throw ResourceNotFound

		return {
			type: getMimeType(resourcePath),
			body: resource
		}
	}

	protected json(data: any): Response {
		return {
			json: data
		}
	}

	protected redirect(redirect: string): Response {
		return {
			redirect
		}
	}

	protected notFound(error?: any): Response {
		return {
			status: 404,
			json: error,
			error
		}
	}

	protected badRequest(error?: any): Response {
		return {
			status: 400,
			json: error,
			error
		}
	}

	// private async respondToGet() {
	// 	const resource = this.shiftPath()
	//
	// 	if (resource === 'favicon') {
	// 		return this.resource('/favicon/' + this.shiftPath())
	// 	}
	// 	else if (resource === 'device') {
	// 		const deviceId = this.shiftPath()
	//
	// 		if (! deviceId) {
	// 			return this.render(new UIDeviceListView(this.client.getState()))
	// 		}
	// 		else if (this.client.hasDevice(deviceId)) {
	// 			const device = this.client.getDevice(deviceId)
	// 			return this.render(new UIDeviceView(this.client.getState(), device.getState()))
	// 		}
	// 		else {
	// 			// device not found
	// 			return this.redirect('/device')
	// 		}
	// 	}
	// 	else if (resource === 'group' || resource === 'location') {
	// 		const groupId = this.shiftPath()
	// 		const isLocation = (resource === 'location')
	//
	// 		if (! groupId) {
	// 			return this.render(new UIGroupListView(this.client.getState()))
	// 		}
	// 		else {
	// 			const devices = (isLocation) ? this.client.getLocation(groupId) : this.client.getGroup(groupId)
	//
	// 			if (devices.length > 0)
	// 				return this.render(new UIDeviceListView(this.client.getState(), groupId, isLocation))
	// 			else
	// 				return this.render(new UIGroupCreateView(this.client.getState(), groupId, isLocation))
	// 		}
	// 	}
	// 	// else return this.render(new UIErrorView(this.client.getState()))
	// 	else throw ResourceNotFound
	// }
	


}
