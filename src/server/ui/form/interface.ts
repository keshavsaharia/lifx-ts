import {
	ClientState,
	DeviceState
} from '../../../interface'

export interface FormSchema<Result> {
	// The key that identifies the form object (e.g. "color", "power", "reboot", etc)
	key: string
	// The current state of the value
	state?: Result
	// Whether to automatically submit when the input changes
	auto?: boolean
	// Fields within this form
	field: Array<FieldSchema<any, Result>>
}

/**
 * @interface 	FieldSchema
 * @desc 		Describes a particular field within a form
 */
export interface FieldSchema<Type, Result> {
	type: string
	key?: string
	name?: string
	label?: string
	value?: (current: Type | null, result: Result | null) => Type
	defaultValue?: (result: Result | null) => Type
	minValue?: Type
	maxValue?: Type
}
