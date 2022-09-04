import fs from 'fs'
import path from 'path'

import {
	LightColor
} from '../../interface'

import {
	RESOURCE_DIR
} from './constant'

export function getValue(obj: { [key: string]: any }, key: string) {
	const k = key.split('.').filter((s) => s.length > 0)
	const k1 = k.shift()
	if (! k1) return null

	let c = obj[k1]
	while (c != null && k.length > 0) {
		if (typeof c === 'object') {
			c = c[k.shift()!]
		}
		else return null
	}
	return c
}

export function getResource(type: string, name: string, minify?: boolean) {
	let extension = path.extname(name)
	if (! extension || extension.length == 0)
		extension = '.' + type
	if (minify)
		extension = '.min' + extension

	const resourcePath = path.join(RESOURCE_DIR, type, path.basename(name) + extension)
	if (fs.existsSync(resourcePath))
		return fs.readFileSync(resourcePath, 'utf-8')
	return ''
}

export function getStaticResource(resourcePath: string) {
	const staticPath = path.join(RESOURCE_DIR, resourcePath)
	if (fs.existsSync(staticPath))
		return fs.readFileSync(staticPath)
	return undefined
}

export function getMimeType(resourcePath: string) {
	const ext = path.extname(resourcePath)
	if (ext === 'png') return 'image/png'
	if (ext === 'svg') return 'image/svg'
	if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
	if (ext === 'ico') return 'image/x-icon'
	if (ext === 'html') return 'text/html'
	if (ext === 'css') return 'text/css'
	if (ext === 'js') return 'text/js'
	return 'text/plain'
}

export function isLightColor(color: any): color is LightColor {
	return color != null && typeof color === 'object' &&
		color.hasOwnProperty('hue') &&
		color.hasOwnProperty('saturation') &&
		color.hasOwnProperty('brightness')
}

export function HSBtoRGB(color: LightColor): { r: number, g: number, b: number } {
	const hue = color.hue * 360
	const saturation = color.saturation * 255
	const brightness = color.brightness * 255

	const max = brightness
	const min = max - ((saturation / 255) * max)
	const range = max - min

	if (hue <= 60)
		return { r: max, g: (hue / 60) * range + min, b: min }
	else if (hue <= 120)
		return { r: ((120 - hue) / 60) * range + min, g: max, b: min }
	else if (hue <= 180)
		return { r: min, g: max, b: ((hue - 120) / 60) * range + min }
	else if (hue <= 240)
		return { r: min, g: ((240 - hue) / 60) * range + min, b: max }
	else if (hue <= 300)
		return { r: ((hue - 240) / 60) * range + min, g: min, b: max }
	else
		return { r: max, g: min, b: ((360 - hue) / 60) * range + min }
}

export function HSBtoCSS(color: LightColor): string {
	const rgb = HSBtoRGB(color)
	return '#' + hexValue(rgb.r) + hexValue(rgb.g) + hexValue(rgb.b)
}

function hexValue(rgb: number): string {
	rgb = Math.max(0, Math.min(Math.floor(rgb), 255))
	return rgb.toString(16)
}
