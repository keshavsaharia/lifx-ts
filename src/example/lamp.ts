import { LifxClient } from '..'

async function main() {
	const lifx = new LifxClient()
	await lifx.discover()

	lifx.onConnect(async (device) => {
		await device.getLabel()
		if (device.getDeviceLabel() === 'Floor Lamp') {
			await device.load()

			device.watchPower().onPower(() => {
				console.log(device.isOn() ? 'lamp on' : 'lamp off')
			})
		}

	})

	// lifx.onLoad(async (device) => {
	// 	if (device.getDeviceLabel() == 'Floor Lamp') {
	// 		await device.turnOn()
	// 	}
	// })
}

main()
