# lifx-ts

Communicates with [LIFX](https://www.lifx.com/) smart bulbs over the local network.

- Robust [TypeScript](https://www.typescriptlang.org/) implementation
- zero external dependencies
- just `npm install lifx-ts`, even in a package without TypeScript

## Discovery

Discover all Lifx products on the local network.

```typescript
import { LifxClient } from 'lifx-ts'

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

## Monitoring

The client can periodically ping each device and handle disconnect/reconnect events.

```typescript
const client = new LifxClient()
await client.discover()
client.monitor()

client.onConnect((device) => device.load())
client.onLoad((device) => console.log(device.getState()))
client.onDisconnect((device) => console.log('Lost ' + device.getDeviceLabel()))
```

## Watching a device

```typescript
client.onConnect((device) => {
	device.watch()
})
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
