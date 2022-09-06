import {
	OptionSchema
} from './interface'

export const PORT_OPTIONS: Array<OptionSchema<number>> = [
	{
		pattern: ['-p', '--port'],
		key: 'port',
		type: 'number',
		name: 'Port',
		description: 'Port to start UDP sockets on',
		defaultValue: () => 56700
	},
	{
		pattern: ['-a', '--app-port'],
		key: 'app_port',
		type: 'number',
		name: 'Application port',
		description: 'Port to start application server on',
		defaultValue: () => 56700
	}
]

export const CLIENT_FLAGS: Array<OptionSchema<any>> = [
	{
		pattern: ['-i', '--interactive'],
		key: 'interactive',
		type: 'boolean',
		name: 'Interactive mode',
		description: 'Start an interactive terminal'
	},
	{
		pattern: ['-g', '--gui', '--app'],
		key: 'app',
		type: 'boolean',
		name: 'Start application',
		description: 'Start the web application for managing/controlling devices'
	}
]

export const CACHE_OPTION: OptionSchema<string> = {
	pattern: ['-c', '--cache'],
	key: 'cache',
	type: 'string',
	name: 'Cache directory',
	description: 'Set the directory for storing state files'
}
