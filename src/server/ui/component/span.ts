import {
	UIElement
} from '..'

export default class UISpan extends UIElement {

	constructor() {
		super('span')
	}

	setSize(px: number): UISpan {
		this.addStyle('font-size', px + 'px')
		return this
	}

}
