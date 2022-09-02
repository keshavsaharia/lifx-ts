import qs from 'querystring'

import {
	UIElement
} from '..'

import {
	DeviceState,
	ResultObject
} from '../../../interface'

interface FormOption<Result> {
	key?: string
	state?: Result
	auto?: boolean
	device?: DeviceState
	input?: Array<FormInput>
}

interface FormInput {
	type: string
	key: string
	label?: string
}

export default class UIForm<Result extends ResultObject> extends UIElement {
	option: FormOption<Result>
	state?: Result

	constructor(option: FormOption<Result>) {
		super('form')
		this.option = option
		this.state = this.option.state

		this.initForm()
		this.initInputs()
		this.initSubmit()
	}

	initForm() {
		this.addAttr('method', 'POST')
		if (this.option.device && this.option.key)
			this.toDevice(this.option.device, this.option.key)
	}

	initInputs() {
		if (! this.option.input)
			return

		this.addAttr('onclick', 'event.stopPropagation()')

		this.option.input.forEach((schema) => {
			const container = this.addNew().addClass('field')

			if (schema.label) {
				const label = container.addNew('label')
				label.add(schema.label)
			}

			const input = container.addNew('input')
			input.addAttr('type', schema.type)
			input.addAttr('name', schema.key)
			// input.addAttr('onclick', 'event.stopPropagation()')

			if (this.state) {
				const value = this.state[schema.key]
				if (schema.type === 'text') {
					if (value != null && typeof value === 'string')
						input.addAttr('value', value)
				}
				else if (schema.type === 'checkbox') {
					container.addClass('switch')
					container.addNew('span').addClass('slider')
						.addAttr('onclick', 'event.stopPropagation();this.previousSibling.checked=!this.previousSibling.checked')

					if (this.option.auto)
						input.addAttr('onchange', 'this.form.submit()')
					input.addAttr('value', 'true')
					if (value === true)
						input.addAttr('checked')
				}
			}
		})
	}

	initSubmit() {
		if (! this.option.auto)
			this.addSubmit()
	}

	toDevice(device: DeviceState, key: string) {
		this.addClass('device')
		this.addAttr('action', '/device/' + device.mac + '/' + key)
	}

	addToggle(key: string) {
		let checked = false
		if (this.state && this.state[key] != null) {
			checked = this.state[key] as boolean
		}
		const checkbox = new UIElement('input')
		checkbox.addAttr('type', 'checkbox')
		if (checked)
			checkbox.addAttr('checked', 'true')
		this.add(checkbox)
	}

	addSubmit() {
		const submit = this.addNew('button')
		submit.addAttr('type', 'submit')
		submit.add('submit')
	}

}
