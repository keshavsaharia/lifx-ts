import {
	UIElement,
	UIStylesheet,
	UIScript
} from '.'

export default class UIPage extends UIElement {
	head: UIElement
	body: UIElement

	scripts?: Set<string>

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

	addStylesheet(stylesheet: Array<string> | string) {
		if (Array.isArray(stylesheet))
			stylesheet.forEach((s) => this.head.add(new UIStylesheet(s)))
		else
			this.head.add(new UIStylesheet(stylesheet))
		return this
	}

	addScript(script: Array<string> | string) {
		if (! this.scripts)
			this.scripts = new Set<string>()

		if (Array.isArray(script))
			script.forEach((s) => this.scripts!.add(s))
		else
			this.scripts.add(script)
		return this
	}

	render() {
		// Add scripts to the end of the body
		if (this.scripts && this.scripts.size > 0) {
			const script = this.body.addNew('script')
			script.addAttr('type', 'text/javascript')
			script.add(new UIScript('lifx', false, false))
			for (const scriptId of this.scripts) {
				script.add(new UIScript(scriptId, false, false))
			}
		}
		// Add doctype to rendered output
		return '<!DOCTYPE html>' + super.render()
	}

}
