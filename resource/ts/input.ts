import {
	LifxForm
} from '.'

export default class LifxInput {
	form: LifxForm
	input: HTMLInputElement
	name: string
	type: string

	submitTimeout: NodeJS.Timer

	constructor(form: LifxForm, input: HTMLInputElement) {
		this.form = form
		this.input = input
		this.name = input.getAttribute('name') || ''
		this.type = input.getAttribute('type') || 'text'
		this.upgrade()
	}

	upgrade() {
		if (this.input.getAttribute('onchange'))
			this.input.removeAttribute('onchange')

		if (this.hasType('checkbox'))
			this.upgradeCheckbox()
		else if (this.hasType('color'))
			this.upgradeColor()
		else
			this.upgradeDefault()

		this.input.addEventListener('change', function(e) {
			this.submit()
		}.bind(this))
	}

	submit() {
		if (this.submitTimeout)
			clearTimeout(this.submitTimeout)

		this.submitTimeout = setTimeout(() => {
			this.form.submit()
		}, 50)
	}

	hasType(type: string) {
		return this.type === type
	}

	upgradeColor() {
		const handler = function(e) {
			this.submit()
		}.bind(this)

		this.input.addEventListener('input', handler)
		this.input.addEventListener('change', handler)
	}

	upgradeCheckbox() {
		const slider = this.getField().querySelector('.slider')
		if (! slider) return

		slider.removeAttribute('onclick')
		slider.addEventListener('click', function(e) {
			this.input.checked = !this.input.checked
			this.submit()
		}.bind(this))
	}

	upgradeNumber() {
		// TODO
	}

	upgradeDefault() {
		this.input.addEventListener('change', this.submit.bind(this))
	}

	getField(): HTMLElement {
		return this.input.parentElement as HTMLElement
	}

}
