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
		this.addFavicon()
	}

	private addFavicon() {
		this.head.addNew('link').addAttr('rel', 'apple-touch-icon')
				 .addAttr('size', '180x180')
				 .addAttr('href', '/favicon/apple-touch-icon.png')
		for (const size of ['16x16', '32x32'])
			this.head.addNew('link').addAttr('rel', 'icon').addAttr('type', 'image/png')
					 .addAttr('size', size)
					 .addAttr('href', '/favicon/favicon-' + size + '.png')
		this.head.addNew('link').addAttr('rel', 'manifest')
				 .addAttr('href', '/favicon/site.webmanifest')
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

	renderScript() {
		// Add scripts to the end of the body
		if (this.scripts && this.scripts.size > 0) {
			// Concatenate all scripts for this app into a single JS module
			const script = this.body.addNew('script')
			script.addAttr('type', 'text/javascript')
			script.add(new UIScript('require', false))
			for (const scriptId of this.scripts) {
				script.add(new UIScript(scriptId, false))
			}
			// Initialize entry point to browser client
			script.add('requirejs(["client"], function(lifx) { new lifx.default() })');
		}
	}

	render() {
		// Render after all scripts added
		this.renderScript()
		// Add doctype to rendered output
		return '<!DOCTYPE html>' + super.render()
	}

}
