import {
	LifxRequest
} from '..'

import {
	Request
} from '../interface'

export default class FaviconRequest extends LifxRequest<any> {

	async respond(request: Request) {
		const resourceName = request.token[0]
		if (resourceName != null)
			return this.resource('favicon/' + resourceName)
		else
			return this.notFound(404)
	}

}
