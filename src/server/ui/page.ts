import {
	UIElement
} from '.'

export default class UIPage extends UIElement {
	head: UIElement
	body: UIElement

	constructor() {
		super('html')
		super.add(this.head = new UIElement('head'))
		super.add(this.body = new UIElement('body'))
	}

	addTitle(title: string) {
		this.head.addNew('title').add(title)
		return this
	}

	add(child: Array<UIElement> | UIElement | string) {
		this.body.add(child)
		return this
	}

	addStylesheet() {
		
	}

	addScript() {

	}

	render() {
		return '<!DOCTYPE html>' + super.render()
	}

}
