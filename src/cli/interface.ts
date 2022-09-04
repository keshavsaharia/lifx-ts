// Function for creating child command objects when their CLI path is targeted
import LifxCommand from './command'
export type LifxChildCommand = (...args: Array<string>) => LifxCommand

// CLI options
export type OptionType = string | number | boolean
export type ParsedOptions = { [key: string]: OptionType }

// Option definition
export interface OptionSchema<Type> {
	// Pattern and the option key to match it to
	pattern: Array<string>
	key: string
	type: 'string' | 'number' | 'boolean'

	// Option description
	name?: string
	description?: string
	exampleValue?: Array<{ value: Type, description: string }>

	// Validation
	defaultValue?: () => Type
	replaceValue?: (value: Type) => Type
	validate?: (value: Type) => boolean
}

export interface StringSchema extends OptionSchema<string> {
	type: 'string'
}

export interface NumberSchema extends OptionSchema<number> {
	type: 'number'
	minValue?: number
	maxValue?: number
}

export interface BooleanSchema extends OptionSchema<boolean> {
	type: 'boolean'
}

export type CLIOption = StringSchema | NumberSchema | BooleanSchema
export type CLIRouter = { [name: string]: { new(): LifxCommand } }

export interface CLISchema {
	child?: CLIRouter
	option?: Array<CLIOption>
}
