import {
	UIElement
} from '..'

import {
	getValue
} from '../util'

import {
	TableKey,
	TableOption
} from './interface'

export default class UITable<Row extends { [key: string]: any }> extends UIElement {
	option: TableOption<Row>

	// thead and tbody elements
	head: UIElement
	body: UIElement

	// Row data and column descriptors
	rows: Array<Row>
	columns: Array<TableKey<Row>>

	constructor(option: TableOption<Row>) {
		super('table')
		this.option = option
		this.add(this.head = new UIElement('thead'))
		this.add(this.body = new UIElement('tbody'))

		this.rows = []
		this.columns = option.columns
	}

	addRow(row: Array<Row> | Row) {
		// Add the row to the internal array
		if (Array.isArray(row))
			row.forEach((r) => this.addRow(r))
		else
			this.rows.push(row)
		return this
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
		if (sort && sort.key)
			// Sort into alphabetical order
			this.rows = this.rows.sort((a, b) => {
				const av = getValue(a, sort.key!)
				const bv = getValue(b, sort.key!)

				// Order with possible empty values
				if (av == null && bv == null) return 0
				else if (av == null) return 1
				else if (bv == null) return -1
				else return av.localeCompare(bv)
			})

		this.rows.forEach((row) => {
			// Create a new row for the table body and add each column to it
			const tr = this.body.addNew('tr')
			if (this.option.redirect) {
				const redirect = this.option.redirect(row)
				if (redirect)
					tr.addAttr('onclick', 'window.location.href = \'' + redirect + '\'')
			}

			this.columns.forEach((column) => {

				// Create a new cell
				const td = tr.addNew('td')
				if (column.format)
					td.addClass(column.format)

				// Add the value to the column
				const value = column.key ? getValue(row, column.key) :
					(column.value ? column.value(null, row) : null)
				if (column.key && column.value)
					td.add(column.value(value, row))
				else if (value != null) {
					if (typeof value === 'number')
						td.add('' + value)
					else
						td.add(value)
				}
			})
		})
	}

	render() {
		this.addHeadColumns()
		this.addRowElements()
		return ['<div class="table">', super.render(), '</div>'].join('')
	}

}
