import {
	UIElement
} from '..'

import {
	getResource
} from '../util'

export default class UIStylesheet extends UIElement {
	stylesheetName: string

	constructor(name: string) {
		super('style')
		this.stylesheetName = name
	}

	render() {
		const stylesheet = getResource('css', this.stylesheetName).replace(/\s*\n(\s|\t)*/g, '')
		return ['<style>', stylesheet, '</style>'].join('')
	}

}
