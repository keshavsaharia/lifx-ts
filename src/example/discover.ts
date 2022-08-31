import { LifxClient } from '..'

async function main() {
	const lifx = new LifxClient()
	await lifx.discover()

	lifx.onConnect((device) => {
		console.log('found ' + device.getIP() + ' (' + device.getMacAddress() + ')')
		device.load()
	})

	lifx.onLoad(async (device) => {
		console.log(device.toString())
	})
}

main()
