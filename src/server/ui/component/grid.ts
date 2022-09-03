import {
	UIElement
} from '..'

export default class UIGrid extends UIElement {

	constructor() {
		super('div')
		this.addStyle('display', 'flex')
	}

	addColumn(percent: number) {
		const column = this.addNew('div')
		column.addStyle('flex', percent + '%')
		return column
	}

}
