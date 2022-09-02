import {
	LifxServer,
	LifxClient
} from '..'

async function main() {
	const client = new LifxClient()
	const server = new LifxServer(client)

	await client.start()
	await server.start()

	await client.discover()
	console.log('done')
}

main()
