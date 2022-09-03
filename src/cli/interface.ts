export type OptionType = string | number | boolean
export type ParsedOptions = { [key: string]: OptionType }

export interface OptionSchema {
	name: Array<string> | string
	type: OptionType
}

export interface CommandSchema {
	option?: Array<OptionSchema>
}
