import {
	UIElement
} from '..'

import {
	getResource
} from '../util'

export default class UIIcon extends UIElement {
	iconName: string
	iconStyle: string
	iconFilled: boolean

	constructor(name: string, style: string = 'outlined', filled: boolean = false) {
		super('svg')
		this.iconName = name
		this.iconStyle = style
		this.iconFilled = filled
	}

	render() {
		return getResource('svg', this.iconName + '-' + this.iconStyle + (this.iconFilled ? '-fill' : ''))
	}

}
