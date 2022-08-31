import dgram from 'dgram'

import {
	LIFX_PORT
} from './constant'

/**
 * @func 	broadcast
 * @desc
 */
export default async function broadcast(socket: dgram.Socket, buffer: Buffer, ip: string): Promise<number> {
	return new Promise((resolve: (bytes: number) => any, reject) => {
		socket.setBroadcast(true)
		socket.send(buffer, 0, buffer.length, LIFX_PORT, ip, (error) => {
			if (error)
				reject(error)
			else
				resolve(buffer.length)
		})
	})
}
