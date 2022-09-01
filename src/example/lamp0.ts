import { LifxClient } from '..'

async function main() {
	const lifx = new LifxClient()
	await lifx.discover()

	lifx.onConnect((device) => device.load())

	lifx.onLoad(async (device) => {
		if (device.getDeviceLabel() == 'Floor Lamp') {
			console.log(device.state)
			// await device.turnOn()
		}
	})
}

main()
