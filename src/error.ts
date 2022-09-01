/**
 * Standard error object
 */
interface LifxError {
	code: string
	message?: string
	value?: any
}

/**
 * Generates an error object
 */
function error(code: string, message?: string, value?: any): LifxError {
	return { code, message }
}

export const SocketError = error('socket',
	'The UDP socket has not been initialized.')

export const HSBValueError = (field: string, value: number) => error('hsb_value',
	(value < 0) ? ('HSB value cannot be negative (' + value + ' for ' + field + ')') :
				  ('HSB value cannot be greater than 1 (' + value + ' for ' + field + ')'),
	value
)

export const KelvinValueError = (value: number) => error('kelvin_value', 'Kelvin value must be between 1500 and 9000')

export const PacketDropError = error('packet_drop', 'The client dropped the packet')
export const PayloadError = error('packet_payload', 'Packet payload is not configured correctly.')

export const ResponseProtocolError = error('response_protocol')
export const ResponseLengthError = error('response_length')

export const DeviceRequestError = error('device_request', 'The device response did not match the device information.')
export const DeviceTimeoutError = error('device_timeout')
export const DeviceFeatureError = (feature: string) =>
	error('device_feature', 'The device does not have the "' + feature + '" feature.')
