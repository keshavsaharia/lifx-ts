import dgram from 'dgram'
import chalk from 'chalk'

import {
	LifxServer,
	LifxClient,
	LifxDevice
} from '..'

import {
	LifxNetworkInterface
} from '../interface'


interface LogMap {
	server: { [func: string]: (server: LifxServer, client: LifxClient) => string }
	client: { [func: string]: (client: LifxClient, device?: LifxDevice) => string }
	device: { [func: string]: (device: LifxDevice, client: LifxClient) => string }
}

function justify(str: string, size: number) {
	if (str.length >= size)
		return str.substring(0, size)

	const pad = [ str ]
	for (let i = str.length ; i < size ; i++)
		pad.push(' ')
	return pad.join('')
}

function clientNetwork(networks: Array<LifxNetworkInterface>) {
	return networks.map((network) => [
		justify(network.address, 20),
		justify(network.broadcast, 20),
		justify(network.netmask, 20)
	].join('')).join('\n')
}

function clientSocket(socket: dgram.Socket) {
	return ''
}

function clientStart(client: LifxClient) {
	return chalk.green('Starting client')
}

function clientStop(client: LifxClient) {
	return chalk.green('Stopping client')
}

function serverStart(client: LifxClient) {
	return 'Starting server'
}

function serverStop(client: LifxClient) {
	return 'Starting server'
}

const Log: LogMap = {
	client: {
		start: clientStart,
		stop: clientStop,
		start_server: serverStart,
		stop_server: serverStop,
		socket: (client) => clientSocket(client.getSocket()),
		network: (client) => clientNetwork(client.getNetwork())
	},
	server: {},
	device: {}
}

export default Log
