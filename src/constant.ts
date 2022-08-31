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
	LIFX_PRODUCT[product.pid] = product
})

export const LIFX_PORT = 56700
export const LIFX_PROTOCOL = 1024
export const LIFX_ADDRESSABLE = 1
export const LIFX_ORIGIN = 0
export const LIFX_UDP_SERVICE = 1

export const PING_TIMEOUT = 3000
export const DEFAULT_TIMEOUT = 3000

export const BROADCAST_TARGET = '00:00:00:00:00:00'
