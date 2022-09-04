import LogFragment from './fragment'

export type LogContent = Array<LogFragment> | LogFragment | string

export interface LogConstraint {
	width: number
	border?: Array<string>
	padding?: Array<number>
	corner?: Array<string>
}
