import { LifxClient } from '..'

async function main() {
	const lifx = new LifxClient()
	await lifx.discover()
	lifx.monitor(2000)

	lifx.onConnect(async (device) => {
		await device.getLabel()
		console.log('connected ' + device.getDeviceLabel())
		if (device.getDeviceLabel() != 'Hallway') {
			device.load()
		}
	})

	lifx.onDisconnect(async (device) => {
		console.log('lost ' + device.getDeviceLabel())
	})

	lifx.onLoad(async (device) => {
		console.log(device.getState())
		await device.turnOff()
	})
}

main()
