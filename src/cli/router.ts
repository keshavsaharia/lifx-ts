import LifxCommand from './command'

import {
	LifxChildCommand,
	CLISchema
} from './interface'

/**
 * Represents a command that selects from a list of child commands and executes it
 * with the subsequent arguments. This allows namespacing of commands, such as
 * "bf app run" - "bf app" triggers a root command, which then passes the remaining
 * arguments to a child command corresponding to "run".
 */
export default class LifxCLIRouter extends LifxCommand {

    /**
     * Initialize the root command.
     */
    constructor(schema: CLISchema) {
        super(schema)
    }

	async execute(name?: string, ...args: Array<string>) {
		if (! this.schema.child) {
			console.log('no child schema')
			return
		}

		if (name == null) {
			this.printManual()
			this.printChildren()
		}

		// If this is a directory of CLI commands
		else if (this.schema.child[name]) {
			const command = new this.schema.child[name]()
			return command.parse(args, this.option)
		}
		// If this was an unrecognized command
		else {
			console.log('error - invalid command "' + name + '"')
			this.printChildren()
		}
	}

    printManual() {
        // Override by child implementation
    }

    printChildren() {
		if (! this.schema.child)
			return

        const children = Object.keys(this.schema.child).sort((a, b) => a.localeCompare(b))
        const maxLength = Math.max(10, ...children.map((child) => child.length))

        children.forEach((child) => {
            const padding = maxLength + 2 - child.length
            console.log(
                child +
                Array.from(Array(padding).keys()).map(() => ' ').join('') +
                (child || '')
            )
        })
    }
}
