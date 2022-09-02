import {
	UIElement
} from '..'

export default class UILink extends UIElement {

	constructor() {
		super('a')
	}

	toPath(href: string) {
		this.addAttr('href', href)
		return this
	}

}
