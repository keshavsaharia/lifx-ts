export default class UIElement {
	tag: string
	cls?: Array<string>
	style?: { [prop: string]: string | number }
	attr?: { [key: string]: string | null }
	child?: Array<UIElement | string>

	constructor(tag?: string) {
		this.tag = tag || 'div'
	}

	add(child: Array<UIElement | string> | UIElement | string) {
		if (! this.child)
			this.child = []
		if (Array.isArray(child))
			this.child.push.apply(this.child, child)
		else
			this.child.push(child)
		return this
	}

	addNew(tag?: string) {
		const el = new UIElement(tag)
		this.add(el)
		return el
	}

	addClass(cls: Array<string> | string) {
		if (! this.cls)
			this.cls = []
		if (Array.isArray(cls))
			this.cls.push.apply(this.cls, cls)
		else
			this.cls.push(cls)
		return this
	}

	addStyle(prop: string, value: string | number) {
		if (! this.style)
			this.style = {}
		this.style[prop] = value
		return this
	}

	addAttr(key: string, value?: string) {
		if (! this.attr)
			this.attr = {}
		this.attr[key] = value || null
		return this
	}

	render(): string {
		const html = ['<', this.tag]
		if (this.attr)
			Object.keys(this.attr).forEach((key) => {
				const value = this.attr![key]
				html.push(' ', key)
				if (value != null)
					html.push('="', value, '"')
			})
		html.push('>')
		if (this.child)
			html.push.apply(html, this.child.map((child) =>
				((typeof child === 'string') ? child : child.render())))
		html.push('</', this.tag, '>')
		return html.join('')
	}
}
