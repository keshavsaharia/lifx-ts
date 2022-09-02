
export default class LogEmitter {

	// 0 - no console output
	// 1 - only client state logs
	// 2 - client and device connectivity logs
	// 3 - all client and device state updates
	// 4 - all client, device, and network events
	logLevel: number = 2
	private logNetworkEvent: Set<string>

	constructor() {

	}

	// private logEvent(event: string, device?: LifxDevice | number, level?: number) {
	// 	const func = Log.client[event]
	// 	if (typeof device === 'number') {
	// 		level = device
	// 		device = undefined
	// 	}
	// 	if (func && (level == null || level <= this.logLevel))
	// 		this.log(func(this, device))
	// 	return this
	// }
	//
	message(message: string) {
		console.log(message)
	}

}
