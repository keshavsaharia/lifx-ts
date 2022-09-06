import fs from 'fs'
import path from 'path'

import {
	CLISchema,
	CLIOption,
	ParsedOptions,
	OptionType
} from './interface'

import {
	isString
} from '../util'

// The prefix before an option on the command line (e.g. lifx start --port 1234)
const DASHES = '--'
const DASH = '-'

/**
 * Represents a CLI command that can be executed with a particular set of arguments.
 * When the command is triggered from the command line, options are first provided with the
 * -option value syntax, with all subsequent arguments passed as an array of strings.
 *
 * lifx command --option value arg1 arg2 ...
 */
export default abstract class LifxCommand {
    schema: CLISchema
	option: ParsedOptions

    constructor(schema?: CLISchema) {
        this.schema = schema || {}
		this.option = {}
    }

    // Execute the command with the given arguments
    abstract execute(...args: Array<string>): Promise<any>

	/**
	 * Parse the given command line options and possibly inherit the options
	 */
	async parse(arg: Array<string>, option?: ParsedOptions): Promise<any> {
        // Extract options from the arguments and include parent options. This allows
        // precedence for options of the same name to be given to child options in a root-child command
		this.option = this.parseOptions(arg, option || {})

        // Use remaining arguments in
        return this.execute(...arg)
    }

    getOption(name: string): OptionType | undefined {
		return this.option ? this.option[name] : undefined
    }

	getString(option: string): string | undefined {
		return this.option ? (this.option[option] as string) : undefined
	}

	getNumber(option: string): number | undefined {
		return this.option ? (this.option[option] as number) : undefined
	}

	getFlag(option: string): boolean {
		return this.option ? (this.option[option] === true) : false
	}

	private parseOptions(arg: Array<string>, inherited: ParsedOptions): ParsedOptions {
		if (! this.schema.option)
			return inherited

		// Create a new option object
		const option = { ...inherited }

		// Create a map for searching registered option patterns
		const pattern: { [p: string]: CLIOption } = {}
		this.schema.option.forEach((schema) => {
			schema.pattern.forEach((p) => (pattern[p] = schema))
		})

        // Extract all arguments which start with an option pattern
        while (arg.length > 0) {
			const next = arg[0]
            const schema = pattern[next]
			// If this was likely an option
			if (next.startsWith(DASHES) || (next.length <= 3 && next.startsWith(DASH))) {
				// TODO: find closest equivalent, better log
				console.log('Invalid option ' + next)
			}
			if (! schema)
				break

			// Remove only one arg if the option is a flag, otherwise get the value
			// as the second spliced value (or undefined if not set)
			const value = arg.splice(0, schema.type === 'boolean' ? 1 : 2)[1]

            // If this is a key-value pair (--option value)
            if (schema.type == 'string')
                option[schema.key] = value
            // If this is a key-value pair with a numeric value, parse the value as an integer
            else if (schema.type == 'number') {
				const int = parseInt(value)
				if (! isNaN(int))
                	option[schema.key] = int
            }
            // Boolean flags are always set to true
            else option[schema.key] = true
        }

		this.schema.option.forEach((schema) => {
			let value: OptionType | undefined = option[schema.key]
			// Validate option
			if (value != null && schema.validate)
				if (! schema.validate(value)) {
					delete option[schema.key]
					value = undefined
				}

			// Default value
			if (value == null && schema.defaultValue)
				option[schema.key] = schema.defaultValue()


		})

		return option
	}


}
