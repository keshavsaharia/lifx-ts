# lifx-ts

Communicate with [LIFX](https://www.lifx.com/) smart bulbs over the local network either programmatically (with full Typescript support), with the built-in management interface, or through the REST API.

- Zero external dependencies, just `npm install -g lifx-ts` to get started
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
// {
//   "pid": 44,
//   "name": "LIFX BR30",
//   "features": {
// 	   "color": true,
// 	   "temperature_range": [ 2500, 9000 ]
//   },
//   "upgrades": [
// 	   {
// 	     "major": 2,
// 	     "minor": 80,
// 	     "features": {
// 		   "temperature_range": [ 1500, 9000 ]
// 	     }
// 	   }
//   ]
// }
```

### `device.echo(text)`

Echo some text to the device and get it as a response.

```typescript
const result = await device.echo('Hey there smart bulb!')
console.log(result)
// Hey there smart bulb!
```

### `device.reboot()`

Reboot the device. Will disconnect the device from the client, so needs to
be rediscovered by another call to `discover()` or by initializing with `.monitor()`.

```typescript
await device.reboot()
```

## Light bulb control

### `device.setPower(on)`

Set the power of the light on/off.

```typescript
await device.setPower(true)

// Alias for setPower(true/false)
await device.turnOn()
await device.turnOff()
```

#### `device.turnOn()`

Equivalent to `setPower(true)`.

#### `device.turnOff()`

Equivalent to `setPower(false)`.

### `device.getPower()`

Reads the current on/off power state of the device as a boolean.

```typescript
const power = await device.getPower()
console.log(power.on) // true/false

// Latest result stored in device.power
console.log(device.power.on)
```

### `device.setLight(on, duration)`

Same as `setPower`, but allows a `duration` (in ms) to also be set.

```typescript
await device.setLight(true, 1000)

// Alias for setLight(true/false, duration)
await device.fadeOn(500)
await device.fadeOff(100)
```

#### `device.fadeOn(duration)`

Equivalent to `setLight(true, duration)`.

#### `device.fadeOff(duration)`

Equivalent to `setLight(false, duration)`.

### `device.getLight()`

Reads the current on/off light power state of the device as a boolean.

```typescript
const light = await device.getLight()
console.log(light.on) // true/false

// Latest result stored in device.power
console.log(device.light.on)
```

### `device.setColor(color [, duration])`

Set the color of a light in HSBK.

### `device.setRGB(r, g, b [, a])`

Set the RGB or RGBA color of a light.

### `device.setCSS(css)`

Set the color of the light with a CSS color, hex string, or `rgb(...)` value.

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
