import LifxCommand from './command'

export type LifxChildCommand = (...args: Array<string>) => LifxCommand

/**
 * Represents a command that selects from a list of child commands and executes it
 * with the subsequent arguments. This allows namespacing of commands, such as
 * "bf app run" - "bf app" triggers a root command, which then passes the remaining
 * arguments to a child command corresponding to "run".
 */
export default class LifxCLIRouter extends LifxCommand {
    child: { [name: string]: LifxChildCommand }
    description: { [name: string]: string | null }

    /**
     * Initialize the root command.
     */
    constructor() {
        super()
        this.child = {}
        this.description = {}
    }

	async execute() {}

    /**
     * Register a child command.
     *
     * @param name - the name of the child command
     * @param child - the child command or a function that produces the child command from the arguments
     */
    command(name: string, child: LifxCommand | LifxChildCommand, description?: string): LifxCLIRouter {
        if (!this.child)
            this.child = {}
        this.child[name] = (child instanceof LifxCommand) ? (() => child) : child
        this.description[name] = description || null
        return this
    }

    /**
     * Overrides the command execution function, taking the first parameter as the name of the child command
     * and the rest of the arguments are passed to the child execution through the `parse` function.
     *
     * @param name - name of the child argument
     * @param args
     */
    async parse(args: Array<string>): Promise<any> {
		const name = args[0]
        if (name == null) {
            this.printManual()
            this.printChildren()
        }

        // If this is a directory of CLI commands
        else if (this.child.hasOwnProperty(name)) {
            const command = this.child[name](...args)
            await command.parse(args, this.option)
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
        const children = Object.keys(this.child).sort((a, b) => a.localeCompare(b))
        const maxLength = Math.max(10, ...children.map((child) => child.length))

        children.forEach((child) => {
            const padding = maxLength + 2 - child.length
            console.log(
                child +
                Array.from(Array(padding).keys()).map(() => ' ').join('') +
                (this.description[child] || '')
            )
        })
    }
}
