import dgram from 'dgram'

export default async function createSocket(port: number, message: (buffer: Buffer, info: dgram.RemoteInfo) => any) {
	return new Promise((resolve: (socket: dgram.Socket) => any, reject) => {
		// Return the UDP socket once it opens
		const udp = dgram.createSocket('udp4')
		udp.once('listening', () => {
			resolve(udp)
		})

		// Throw an error to allow the client to retry this method without setting the
		// instance-level udp parameter
		udp.once('error', (error) => {
			reject(error)
		})

		udp.once('close', () => {
			console.log('closing socket')
			udp.off('message', message)
		})

		// Pass incoming messages to the client handler
		udp.on('message', message)

		// Bind the socket to start
		udp.bind({ port })
	})
}
