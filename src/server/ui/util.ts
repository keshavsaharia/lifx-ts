
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
