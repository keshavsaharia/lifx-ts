import {
	UIElement
} from '..'

import {
	ResultObject
} from '../../../interface'

import {
	getValue
} from '../util'

interface UITableKey<Row> {
	name: string
	key: string
	value?: (cell: string | number | boolean, row: Row) => Array<UIElement> | UIElement | string
	format?: string
	sort?: boolean
}

export default class UITable<Row extends ResultObject> extends UIElement {

	// thead and tbody elements
	head: UIElement
	body: UIElement

	// Row data and column descriptors
	rows: Array<Row>
	columns: Array<UITableKey<Row>>

	constructor(columns: Array<UITableKey<Row>>) {
		super('table')
		this.add(this.head = new UIElement('thead'))
		this.add(this.body = new UIElement('tbody'))

		this.rows = []
		this.columns = columns
	}

	addRow(row: Array<Row> | Row) {
		// Add the row to the internal array
		if (Array.isArray(row))
			row.forEach((r) => this.addRow(r))
		else {
			this.rows.push(row)
		}
	}

	private addHeadColumns() {
		this.columns.forEach((column) => {
			const th = this.head.addNew('th')
			if (column.format)
				th.addClass(column.format)
			th.add(column.name)
		})
	}

	private addRowElements() {
		const sort = this.columns.find((c) => (c.sort == true))
		if (sort)
			// Sort into alphabetical order
			this.rows = this.rows.sort((a, b) => {
				const av = getValue(a, sort.key)
				const bv = getValue(b, sort.key)

				// Order with possible empty values
				if (av == null && bv == null) return 0
				else if (av == null) return 1
				else if (bv == null) return -1
				else return av.localeCompare(bv)
			})

		this.rows.forEach((row) => {
			// Create a new row for the table body and add each column to it
			const tr = this.body.addNew('tr')
			this.columns.forEach((column) => {

				// Create a new cell
				const td = tr.addNew('td')
				if (column.format)
					td.addClass(column.format)

				// Add the value to the column
				const value = getValue(row, column.key)
				if (value != null)
					td.add(column.value ? column.value(value, row) : ('' + value))
			})
		})
	}

	render() {
		this.addHeadColumns()
		this.addRowElements()
		return super.render()
	}

}
