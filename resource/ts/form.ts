import {
	LifxClient,
	LifxInput
} from '.'

export default class LifxForm {
	client: LifxClient
	form: HTMLFormElement
	action: string
	inputs: Array<LifxInput>

	constructor(client: LifxClient, form: HTMLFormElement) {
		this.client = client
		this.form = form
		this.action = form.getAttribute('action') || '/'

		const inputs = form.querySelectorAll('input')
		this.inputs = []
		inputs.forEach((input) => {
			this.inputs.push(new LifxInput(this, input))
		})
	}

	submit() {
		const formData = new FormData(this.form)
		const object: { [key: string]: any } = {}

		formData.forEach((value, key) => {
		    if(! object.hasOwnProperty(key))
		        object[key] = value
		    else {
				if (! Array.isArray(object[key]))
					object[key] = [ object[key] ]
				object[key].push(value)
			}
		})
		this.client.send(this.action, object, () => {

		})
	}
}
