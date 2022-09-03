import {
	UIElement
} from '..'

import {
	getResource
} from '../util'

export default class UIScript extends UIElement {
	scriptName: string
	scriptWrap: boolean
	scriptMinify: boolean

	constructor(name: string, minify: boolean = false, wrap: boolean = true) {
		super('style')
		this.scriptName = name
		this.scriptMinify = minify
		this.scriptWrap = wrap
	}

	render() {
		let script = getResource('js', this.scriptName)
		if (this.scriptMinify) {
			// Remove comments
			script = script.replace(/\/\/.*\n/g, '')
			script = script.replace(/\/\/?\*.*\*\//g, '')
			// Remove newlines and spaces
			script = script.replace(/\)\s+\{\n\s*/g, '){')
			script = script.replace(/(\w)([\w\d]*)\s*(\=|\=\=|\+|\+\=|\>\=|\<\=)\s*/g, '$1$2$3')
			script = script.replace(/\)\n\t+/g, ')')
			script = script.replace(/\;\n\t*(\}+)(\;?)\n*\s*/g, '$1$2')
			script = script.replace(/\n\t*/g, '')
			script = script.replace(/\)\s+(\w)/g, ')$1')
			script = script.replace(/\;\s+}\s*/g, '}')
		}
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
