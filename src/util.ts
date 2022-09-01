import os from 'os'

import {
	HSBColor
} from './interface'

import {
	CSS_COLOR
} from './constant'

export function IPv4Array(address: string) {
	return address.split(/\./).map((n) => parseInt(n, 10))
}

export function IPv4Masked(address: string, netmask: string) {
	const addr = IPv4Array(address)
	const mask = IPv4Array(netmask)

	return addr.map((n, i) => (mask[i] == 0) ? 255 : n).join('.')
}

export function isIPv4Interface(info: os.NetworkInterfaceInfo) {
	return (info.family === 'IPv4' || (('' + info.family) === '4')) &&
			info.internal !== true &&
			!DHCPUnreachable(info.address)
}

export function DHCPUnreachable(address: string) {
	return address.startsWith('169.254.')
}

export function isMacAddress(address: string) {
	return address.split(':').every((part) => part.match(/^0-9a-f]$/i) != null)
}

export function parseMacAddress(address: string): Buffer {
	const buffer = Buffer.alloc(16)

	address.split(':').forEach((part, offset) => {
		const value = parseInt(part, 16)
		buffer.writeUInt8(value, offset)
	})

	return buffer
}

export function objectEqual(a: any, b: any) {
	if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object')
		return false

	const ak = Object.keys(a),
		  bk = Object.keys(b)

	return ak.length === bk.length && ak.every((k) => a[k] === b[k]) && bk.every((k) => a[k] === b[k])
}

export function wait(ms: number) {
	return new Promise((resolve: (ms: number) => any) => {
		setTimeout(() => {
			resolve(ms)
		}, ms)
	})
}

export function isHSBValue(value: number) {
	return value >= 0 && value <= 1
}


export function CSStoHSB(css: string) {
	css = css.toLowerCase().trim()

	if (CSS_COLOR[css])
		return RGBtoHSB.apply(null, CSS_COLOR[css])

	if (css.startsWith('#') && css.length == 7)
		return RGBtoHSB(
			parseInt(css.substring(1, 3), 16),
			parseInt(css.substring(3, 5), 16),
			parseInt(css.substring(5, 7), 16))

	if ((css.startsWith('rgb(') || css.startsWith('rgba(')) && css.endsWith(')'))
		return RGBtoHSB.apply(null, css.substring(4, css.length - 1).split(','))

	return RGBtoHSB(0, 0, 0)
}

export function RGBtoHSB(r: number, g: number, b: number, a?: number): HSBColor {
	// Determine the max and min value in RGB
	let max = Math.max(r, g, b);
	let min = Math.min(r, g, b);

	// HSB values
	let hue = 0,
		saturation = (max > 0) ? ((max - min) / max) : 0,
		brightness = (a != null) ? a : (max / 255)

	// Calculate hue
	if(r === max && g === max && b === max)
		hue = 0
	else if (r === max)		hue = 60 * ((g - b) / (max - min))
	else if (g === max)		hue = 60 * ((b - r) / (max - min)) + 120
	else					hue = 60 * ((r - g) / (max - min)) + 240;
	hue = (hue < 0 ? (hue + 360) : hue) / 360

	return { hue, saturation, brightness }
}
