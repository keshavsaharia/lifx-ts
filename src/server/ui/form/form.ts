import {
	UIElement
} from '..'

import UIField from './field'

import {
	FormSchema
} from './interface'

export default class UIForm<Result extends { [key: string]: any }> extends UIElement {
	schema: FormSchema<Result>
	state?: Result

	constructor(schema: FormSchema<Result>, state?: Result) {
		super('form')
		this.schema = schema
		this.state = state

		this.schema.field.forEach((field) => {
			const value = (this.state && field.key) ? this.state[field.key] : undefined
			this.add(new UIField(field, this.schema, value, this.state))
		})

		if (! this.schema.auto) {
			const submit = this.addNew('button')
			submit.addAttr('type', 'submit')
			submit.add('submit')
		}
	}

	stopPropagation() {
		this.addAttr('onclick', 'event.stopPropagation()')
		return this
	}

	addAction(action: string) {
		this.addAttr('method', 'POST')
		this.addAttr('action', action)
	}

}
