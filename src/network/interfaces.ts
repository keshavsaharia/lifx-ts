import os from 'os'

import {
	LifxNetworkInterface
} from './interface'

import {
	IPv4Masked,
	isIPv4Interface
} from './util'

export default function getIPv4Interfaces(): Array<LifxNetworkInterface> {
	const network: Array<LifxNetworkInterface> = []

	// Initialize network interfaces from OS
	const networkInterfaces = os.networkInterfaces()

	Object.keys(networkInterfaces).forEach((device) => {
		// Get the array of network interfaces for this device
		const interfaces = networkInterfaces[device]
		if (! interfaces)
			return

		interfaces.forEach((info) => {
			if (isIPv4Interface(info))
				network.push({
					address: info.address,
					netmask: info.netmask,
					broadcast: IPv4Masked(info.address, info.netmask),
					cidr: info.cidr,
					mac: info.mac
				})
		})
	})

	return network
}
