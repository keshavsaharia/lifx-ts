# ts-lifx

Communicates with [LIFX](https://www.lifx.com/) smart bulbs over the local network.

- Robust [TypeScript](https://www.typescriptlang.org/) implementation
- zero external dependencies
- just `npm install ts-lifx`, even in a package without TypeScript

## Discovery

```typescript
import { LifxClient, LifxDevice } from 'ts-lifx'

async function discovery() {
	const client = new LifxClient()
	await client.discover()

	client.onConnect(async (device) => {
		console.log('IP:  ' + device.getIP())
		console.log('MAC: ' + device.getMacAddress())
	})
}

discovery()
```

## Device

### `device.turnOn()`

Turn on the device.

### `device.turnOff()`

Turn off the device.

### `device.setColor(color [, duration])`

Set the color of a light in HSBK.

### `device.setRGB(r, g, b [, a])`

Set the RGB or RGBA color of a light.

## Roadmap

- [ ] write README and documentation
- [ ] commenting
- [ ] jest testing
- [ ] support more LIFX products

## Contributing

To make changes to the module, you will need `typescript`.

```
cd ts-lifx
npm install -g typescript
tsc --watch
```
