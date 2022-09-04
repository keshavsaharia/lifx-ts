import {
	UIElement
} from '..'

import {
	getResource
} from '../util'

export default class UIScript extends UIElement {
	scriptName: string
	scriptWrap: boolean

	constructor(name: string, wrap: boolean = true) {
		super('style')
		this.scriptName = name
		this.scriptWrap = wrap
	}

	render() {
		let script = getResource('js', this.scriptName)
		// Return script without enclosing in script element
		if (! this.scriptWrap)
			return script

		return ['<script type="text/javascript">\n',
					'(function(){\n',
						script,
					'})();\n',
			'</script>'].join('')
	}

}
