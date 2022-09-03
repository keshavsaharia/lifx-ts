interface ServerError {
	status: number
	message?: string
}

function error(status: number, message?: string): ServerError {
	return { status, message }
}

export const InvalidWebsocketMessage = error(500)

export const UnsupportedWebsocketMessage = error(500)
