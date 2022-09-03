import {
	UIElement
} from '..'

export interface TableKey<Row> {
	name: string
	key?: string
	value?: (cell: string | number | boolean | null, row: Row) => Array<UIElement> | UIElement | string
	format?: string
	sort?: boolean
}

export type TableRedirect<Row> = (row: Row) => string | null

export interface TableOption<Row> {
	columns: Array<TableKey<Row>>
	redirect?: TableRedirect<Row>
}
