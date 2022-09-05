import LogEmitter from './emitter'

export type KeyHandler = { [name: string]: KeypressHandler }
export type KeypressHandler = (key: Keypress, emitter: LogEmitter) => Promise<any>

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
