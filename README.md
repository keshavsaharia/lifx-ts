# lifx-ts

Communicates with [LIFX](https://www.lifx.com/) smart bulbs over the local network through an object-oriented module written in TypeScript.

- Zero external dependencies, just `npm install lifx-ts` to get started
- All asynchronous functions return a `Promise`
- Abstracts binary protocol into easily extensible [Packet objects](./src/packet)
- Robustly manages UDP broadcast, unicast, rate limiting, and message queueing

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

When a device reaches the "connected" state, the client has only learned about its IP address, MAC address, and UDP port number (always 56700). To load the full device state, call `device.load()` when the device is connected, and `device.getState()` when the state has been loaded.

```typescript
import { LifxClient } from 'lifx-ts'

async function discovery() {
	const lifx = new LifxClient()
	await lifx.discover()

	lifx.onConnect((device) => device.load())
    lifx.onLoad((device) => console.log(device.getState()))
}

discovery()
```

## Monitoring

The client can periodically ping each device and handle disconnect/reconnect events.

```typescript
const lifx = new LifxClient()
await lifx.discover()
lifx.monitor()

lifx.onConnect((device) => console.log('Found ' + device.toString()))
lifx.onDisconnect((device) => console.log('Lost ' + device.toString()))
```

Client monitoring automatically drops timed-out devices and attempts to discover new devices on the network. Each device can be independently monitored, and uses the same event-based architecture as the client to communicate state changes.

```typescript
lifx.onConnect((device) => {
	device.watchPower(1000)	// update every second
    device.onPower(() => {	// on change
      console.log(device.getName() + ' is ' + (device.isOn() ? 'on' : 'off'))
    })
})
```

Event functions (`watch*`, `on*`) return a reference to the called instance for chaining.

```typescript
const lifx = new LifxClient()
lifx.onConnect((device) => {
		device.load()
	})
	.onLoad((device) => {
		if (device.hasColor())
			device.watchColor()
				  .watchPower()
	        	  .onColor((color) => {
				      console.log(device.getName(), color)
	        	  })
				  .onPower((power) => {
					  console.log(device.getName(), power.on)
				  })
	})
```

## Device management

These are asynchronous functions (i.e. returning a `Promise` object) for managing and testing a device.

### `device.getFirmware()`

Returns the device firmware.

```typescript
console.log(await device.getFirmware())
// {
//   "build": 1604880106000000000,
//   "version_minor": 70,
// 	 "version_major": 3
// }
```

### `device.getVersion()`

Returns the type and version of this Lifx product. Automatically sets `device.product` with the product information (name, features, temperature range, etc) [provided by Lifx](data/products.json).

```typescript
console.log(await device.getVersion())
// {
//   "vendor": 1,
//   "product": 93
// }

console.log(device.product)

```


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
