export interface KeyHandler {
	[name: string]: (key: Keypress) => Promise<any>
}

export interface Keypress {
	name?: string
	code?: string
	ctrl?: boolean
	meta?: boolean
	shift?: boolean
	sequence?: string
	exit?: boolean
}

export * from './fragment/interface'
