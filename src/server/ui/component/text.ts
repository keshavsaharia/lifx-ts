import {
	UIElement
} from '..'

export default class UIText extends UIElement {

	constructor() {
		super('p')
	}

	setSize(px: number): UIText {
		this.addStyle('font-size', px + 'px')
		return this
	}

}
