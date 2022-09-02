import {
	UIElement
} from '..'

import {
	ResultObject
} from '../../../interface'

interface UITableKey {
	name: string
	key: string
	format?: string
}

export default class UITable<Row extends ResultObject> extends UIElement {

	// thead and tbody elements
	head: UIElement
	body: UIElement

	// Row data and column descriptors
	rows: Array<Row>
	columns: Array<UITableKey>

	constructor(columns: Array<UITableKey>) {
		super('table')
		super.add(this.head = new UIElement('thead'))
		super.add(this.body = new UIElement('tbody'))

		this.rows = []
		this.columns = columns

		columns.forEach((column) => {
			const th = this.head.addNew('th')
			if (column.format)
				th.addClass(column.format)
			th.add(column.name)
		})
	}

	addRow(row: Array<Row> | Row) {
		if (Array.isArray(row))
			row.forEach((r) => this.addRow(r))
		else {
			this.rows.push(row)

			const tr = this.body.addNew('tr')
			this.columns.forEach((column) => {
				const td = tr.addNew('td')
				if (column.format)
					td.addClass(column.format)

				const value = row[column.key]
				if (value != null) {
					if (typeof value === 'string' || typeof value === 'number')
						td.add('' + value)

				}
			})
		}
	}

}
