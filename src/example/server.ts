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

	client.onConnect((device) => device.load())

	client.onLoad((device) => {
		// console.log('Loaded ' + device.getName())
	})

	process.on('unhandledRejection', (reason, p) => {
	  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	  // application specific logging, throwing an error, or other logic here
	});
}

main()
