import os from 'os'

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
