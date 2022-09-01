import { LifxClient } from '..'

async function main() {
	const lifx = new LifxClient()
	await lifx.discover()
	lifx.monitor(2000)

	lifx.onConnect(async (device) => {
		await device.getLabel()
		console.log('connected ' + device.getDeviceLabel())
		device.load()
	})

	lifx.onDisconnect(async (device) => {
		console.log('lost ' + device.getDeviceLabel())
	})

	lifx.onLoad(async (device) => {
		console.log('loaded ' + device.getDeviceLabel())
		console.log('time: ' + new Date(device.info!.time))
	})
}

main()
