#!/usr/bin/env node

import LifxCLI from './cli'

async function run() {
	const cli = new LifxCLI()
	await cli.parse(process.argv.slice(2))
}

run()
