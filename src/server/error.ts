interface ServerError {
	status: number
	message?: string
	toString?: () => string
}

function error(status: number, message?: string): ServerError {
	const e: ServerError = { status, message }
	if (status === 400)
		e.toString = function() {
			return 'HTTP/1.1 400 Bad Request'
		}
	return e
}

export const ResourceNotFound = error(404)

export const InvalidWebsocketMessage = error(500)

export const UnsupportedWebsocketMessage = error(500)
