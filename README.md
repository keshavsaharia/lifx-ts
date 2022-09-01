# lifx-ts

Communicates with [LIFX](https://www.lifx.com/) smart bulbs over the local network.

- Robust [TypeScript](https://www.typescriptlang.org/) implementation
- zero external dependencies
- just `npm install lifx-ts`, even in a package without TypeScript

## Discovery

```typescript
import { LifxClient, LifxDevice } from 'lifx-ts'

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

## Device management

### `device.getFirmware()`

### `device.getVersion()`

### `device.echo()`

### `device.reboot()`

## Light bulb control

### `device.turnOn()`

Turn on the device.

### `device.turnOff()`

Turn off the device.

### `device.getPower()`

Returns the on/off power state of the device as a boolean.

```typescript
const power = await device.getPower()
console.log(power.on) // true/false
```

### `device.fadeOn(duration)`

Fade the device to on over the given duration.


### `device.getPower()`

Returns the on/off power state of the device as a boolean.

```typescript
const power = await device.getPower()
console.log(power.on) // true/false
```

### `device.setPower(on)`

Sets the on/off power state of the device as a boolean.

```typescript
await device.setPower(true)
await device.turnOn()	// equivalent
```


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
cd lifx-ts
npm install -g typescript
tsc --watch
```
