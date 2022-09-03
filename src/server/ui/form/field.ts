import {
	UIElement
} from '..'

import {
	FormSchema,
	FieldSchema
} from './interface'

import {
	LightColor
} from '../../../interface'

import {
	isLightColor,
	HSBtoCSS
} from '../util'

export default class UIField<Type, Result> extends UIElement {
	schema: FieldSchema<Type, Result>
	formSchema: FormSchema<Result>
	state?: Type
	formState?: Result
	label: UIElement
	input: UIElement

	constructor(schema: FieldSchema<Type, Result>, formSchema: FormSchema<Result>, state?: Type, formState?: Result) {
		super()
		this.schema = schema
		this.formSchema = formSchema
		this.state = state
		this.formState = formState

		this.addClass('field')

		if (schema.label)
			this.label = this.addNew('label').add(schema.label)

		this.input = this.addNew('input')
		if (schema.key || schema.name)
			this.input.addAttr('name', schema.key || schema.name)

		switch (schema.type) {
		case 'text': this.inputText(); break;
		case 'number': this.inputNumber(); break;
		case 'switch':
		case 'checkbox': this.inputCheckbox(); break;
		case 'slider':
		case 'range': this.inputSlider(); break;
		case 'color': this.inputColor(); break;
		}

		if (formSchema.auto) {
			this.input.addAttr('onchange', 'this.form.submit()')
		}
	}

	inputText() {
		if (this.schema.key)
			this.addClass('input-' + this.schema.key)
		this.input.addAttr('type', 'text')
		if (this.state != null && typeof this.state === 'string')
			this.input.addAttr('value', this.state)
	}

	inputNumber() {
		this.input.addAttr('type', 'number')
		if (this.state != null && typeof this.state === 'number')
			this.input.addAttr('value', '' + this.state)
	}

	inputSlider() {
		this.addClass('slider')
		this.input.addAttr('type', 'range')
		if (this.state != null && typeof this.state === 'number')
			this.input.addAttr('value', '' + this.state)
		if (this.schema.maxValue != null)
			this.input.addAttr('max', '' + this.schema.maxValue)
		if (this.schema.minValue != null)
			this.input.addAttr('min', '' + this.schema.minValue)
	}

	inputCheckbox() {
		this.input.addAttr('type', 'checkbox')
		this.input.addAttr('value', 'true')

		if (this.state != null && typeof this.state === 'boolean' && this.state === true)
			this.input.addAttr('checked')

		if (this.schema.type === 'switch') {
			this.addClass('switch')
			const slider = this.addNew('span')
			slider.addClass('slider')
			slider.addAttr('onclick', 'event.stopPropagation();this.previousSibling.checked=!this.previousSibling.checked')
		}
	}

	inputColor() {
		this.addClass('color')
		this.input.addAttr('type', 'color')

		if (isLightColor(this.formState)) {
			this.input.addAttr('value', HSBtoCSS(this.formState))
		}
	}
}
