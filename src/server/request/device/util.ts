export function getBoolean(key: string, data?: { [key: string]: any }): boolean {
	if (! data)
		return false
	return data[key] === true || data[key] === 'true'
}

export function getNumber(key: string, data?: { [key: string]: any }): number | undefined {
	if (! data || data[key] == null)
		return undefined
	const value = parseFloat(data[key])
	if (! isNaN(value))
		return value
}

export function getString(key: string, data?: { [key: string]: any }): string | undefined {
	return (data && data[key] != null && typeof data[key] === 'string') ? data[key] : undefined
}
