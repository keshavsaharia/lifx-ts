export interface LifxNetworkInterface {
	address: string
	netmask: string
	// Masked broadcast IPv4 address
	broadcast: string
	// MAC address
	mac: string
	// CIDR block
	cidr: string | null
}
