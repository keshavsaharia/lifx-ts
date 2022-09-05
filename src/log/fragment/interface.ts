import LogFragment from './fragment'

export type LogContent = Array<LogFragment | string> | LogFragment | string

export interface LogConstraint {
	width: number
	border?: Array<string | null>
	padding?: Array<string | null>
	corner?: Array<string | null>
}
