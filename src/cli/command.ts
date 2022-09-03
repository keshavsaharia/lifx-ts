import fs from 'fs'
import path from 'path'

import {
	CommandSchema,
	ParsedOptions,
	OptionType
} from './interface'

// The prefix before an option on the command line (e.g. lifx start --port 1234)
const OPTION_PREFIX = '--'

/**
 * Represents a CLI command that can be executed with a particular set of arguments.
 * When the command is triggered from the command line, options are first provided with the
 * -option value syntax, with all subsequent arguments passed as an array of strings.
 *
 * lifx command --option value arg1 arg2 ...
 */
export default abstract class LifxCommand {
    schema: CommandSchema
	option?: ParsedOptions

    constructor(schema?: CommandSchema) {
        this.schema = schema || {}
    }

    // Execute the command with the given arguments
    abstract execute(...args: Array<string>): Promise<any>

	async parse(arg: Array<string>, option?: ParsedOptions): Promise<any> {
        // Extract options from the arguments and include parent options. This allows
        // precedence for options of the same name to be given to child options in a root-child command
        // like bf app --port 1234 run --port 2345 (port 2345 gets precedence).
        this.option = Object.assign(this.option || {}, option)

        // Extract all arguments which start with the --xyz name.
        while (arg.length > 0 && arg[0].startsWith(OPTION_PREFIX)) {
            const key = arg[0].substring(OPTION_PREFIX.length)
            const schema = this.schema.option ?
				this.schema.option.find((option) => (
					(Array.isArray(option.name) && option.name.some((name) => (name == key))) ||
					option.name === key
				)) : null

            if (! schema) {
                console.log('Invalid option ' + key)
                arg.splice(0, 1)
                continue
            }

            // If this is a key-value pair (--option value)
            if (schema.type == 'string') {
                this.option[key] = arg[1]
                arg.splice(0, 2)
            }
            // If this is a key-value pair with a numeric value, parse the value as an integer
            else if (schema.type == 'number') {
                this.option[key] = parseInt(arg[1])
                arg.splice(0, 2)
            }
            // Boolean flags are always set to true
            else {
                this.option[key] = true
                arg.splice(0, 1)
            }
        }

        // Use remaining arguments in
        return this.execute(...arg)
    }

    getFile(filePath: string): string | null {
        try {
            return fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8')
        }
        catch (e) {
            return null
        }
    }

    getJSON(filePath: string): { [key: string]: any } | null {
        try {
            return JSON.parse(fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8'))
        }
        catch (e) {
            return null
        }
    }

    getOption(option: string): OptionType | undefined {
		if (! this.option)
			return undefined

        const value = this.option[option]
		return value
    }

}
