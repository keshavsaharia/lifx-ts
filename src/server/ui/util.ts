import fs from 'fs'
import path from 'path'

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

export function getResource(type: string, name: string) {
	const resourcePath = path.join(RESOURCE_DIR, type, name + '.' + type)
	if (fs.existsSync(resourcePath))
		return fs.readFileSync(resourcePath, 'utf-8')
	return ''
}
