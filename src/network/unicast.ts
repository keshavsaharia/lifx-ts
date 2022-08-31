import dgram from 'dgram'

export default async function unicast(socket: dgram.Socket, buffer: Buffer, ip: string, port: number): Promise<number> {
	return new Promise((resolve: (bytes: number) => any, reject) => {
		socket.setBroadcast(false)
		socket.send(buffer, 0, buffer.length, port, ip, (error) => {
			if (error)
				reject(error)
			else
				resolve(buffer.length)
		})
	})
}
