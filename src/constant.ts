import fs from 'fs'
import path from 'path'

const data = (name: string) => JSON.parse(
	fs.readFileSync(path.join(__dirname, '../data', name + '.json'), 'utf8'))

export const CSS_COLOR = data('color') as { [key: string]: Array<number> }

import {
	LifxVendor,
	LifxProduct
} from './interface'

export const LIFX_VENDOR = data('products') as Array<LifxVendor>
export const LIFX_PRODUCT = {} as { [pid: number]: LifxProduct }
LIFX_VENDOR[0].products.forEach((product) => {
	// Trim false values
	const features: { [key: string]: any } = product.features
	Object.keys(features).forEach((f) => {
		if (features[f] === false)
			delete features[f]
	})
	// Set temperature min/max
	if (product.features.temperature_range)
		product.temperature = {
			min: product.features.temperature_range[0],
			max: product.features.temperature_range[1]
		}
	// Trim empty upgrade list
	if (product.upgrades && product.upgrades.length == 0)
		delete product.upgrades
	LIFX_PRODUCT[product.pid] = product
})

export const LIFX_PORT = 56700
export const LIFX_PROTOCOL = 1024
export const LIFX_ADDRESSABLE = 1
export const LIFX_ORIGIN = 0
export const LIFX_UDP_SERVICE = 1

export const CLIENT_CLOSE_TIMEOUT = 5000
export const SERVER_CLOSE_TIMEOUT = 3000

export const LIFX_STATE_KEYS = ['firmware', 'version', 'info', 'label', 'group', 'location', 'power', 'light', 'color', 'infrared']
export const LIFX_FEATURES = ['hev', 'color', 'infrared', 'chain', 'matrix', 'relays', 'buttons', 'multizone', 'extended_multizone']

export const PING_TIMEOUT = 5000
export const DEFAULT_TIMEOUT = 3000
export const DEFAULT_INTERVAL = 10000
export const RATE_LIMIT = 10
export const DEFAULT_TEMPERATURE = 2700

export const BROADCAST_TARGET = '00:00:00:00:00:00'
export const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
