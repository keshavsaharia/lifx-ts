import {
	LifxServer,
	LifxClient
} from '..'

async function main() {
	const client = new LifxClient()
	await client.start()
	await client.startServer()
	await client.discover()

	// Start interactive logging
	// client.log.interactive()

	client.onConnect((device) => device.load())

	client.onLoad((device) => {
		// console.log('Loaded ' + device.getName())
	})

	// process.on('unhandledRejection', (reason, p) => {
	//   console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	//   // application specific logging, throwing an error, or other logic here
	// });
}

main()
