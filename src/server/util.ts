export function isBoolean(value: any): value is boolean {
	return value != null && typeof value === 'boolean'
}

export function parseBoolean(value: any): boolean {
	return value === 'true'
}

export function isNumber(value: any): value is number {
	return value != null && typeof value === 'number'
}

export function parseNumber(value: any): number | undefined {
	const v = parseFloat(value)
	if (! isNaN(v))
		return v
}

export function isString(value: any): value is string {
	return value != null && typeof value === 'string'
}

export function parseString(value: any): string | undefined {
	if (value != null && typeof value === 'string')
		return value
}

export function isObject(value: any): value is { [key: string]: any } {
	return value != null && typeof value === 'object'
}

export function parseObject(obj: { [key: string]: any }, keys: Array<string>): { [key: string]: any } {
	keys.forEach((key) => {
		const value = obj[key]
		if (isString(value)) {
			if (value.match(/^\-?\d+(\.\d*)?$/)) {
				obj[key] = parseFloat(value)
				if (isNaN(obj[key]))
					delete obj[key]
			}
			else if (value === 'true')
				obj[key] = true
			else if (value === 'false')
				obj[key] = false
		}
		else if (isNumber(value)) {
			if (isNaN(value))
				delete obj[key]
		}
	})
	return obj
}
