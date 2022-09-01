import { LifxClient } from '..'

async function main() {
	const lifx = new LifxClient()
	await lifx.discover()
	lifx.monitor(2000)

	lifx.onConnect(async (device) => {
		await device.getLabel()
		console.log('connected ' + device.getName())
		if (device.getName() != 'Hallway') {
			device.load()
		}
	})

	lifx.onDisconnect(async (device) => {
		console.log('lost ' + device.getName())
	})

	lifx.onLoad(async (device) => {
		console.log(device.getState())
		device.watchColor(1000).onColor((color) => {
			console.log(device.getName(), color)
		})
		await device.turnOff()
	})
}

main()
