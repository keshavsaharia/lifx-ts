export interface Cursor {
	x: number
	y: number
}

export interface Location {
	x: number
	y: number
	width: number
	height: number

	// For recursive rendering inline text
	cursor?: number
	wrap?: boolean
}

export interface Dimension {
	// Sizing, defaults to parent size
	width?: number
	height?: number
	padding?: number | Array<number>

	// Alignment and inline (side-by-side) placement of views
	inline?: boolean
	align?: 'left' | 'center' | 'right'
	// For writing text, allows text to wrap onto next line and optionally add a dash
	wrap?: boolean
	dash?: boolean
}
