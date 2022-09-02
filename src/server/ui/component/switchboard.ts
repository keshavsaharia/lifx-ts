import {
	UIElement,
	UISwitch
} from '..'

export default class UISwitchboard extends UIElement {

	constructor() {
		super('div')

	}

	addSwitch(element: UISwitch) {
		this.add(element)
	}
}
