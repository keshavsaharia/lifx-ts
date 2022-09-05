import {
	LifxDevice
} from '../../..'

import LifxRequest from '../request'

import {
	Request,
	RequestData
} from '../interface'

import {
	getString,
	getNumber
} from './util'

export default class LifxDeviceColorRequest extends LifxRequest<LifxDevice> {

	async respond({ data }: Request, device: LifxDevice) {
		if (! data)
			return this.badRequest()

		const css = getString('css', data)
		const kelvin = getNumber('kelvin', data)
		const duration = getNumber('duration', data)

		if (css)
			return this.json(await device.setCSS(css, kelvin))

		if (data.r != null && data.g != null && data.b != null) {
			const r = getNumber('r', data)
			const g = getNumber('g', data)
			const b = getNumber('b', data)
			const a = getNumber('a', data)

			if (r != null && g != null && b != null)
				return this.json(await device.setRGB(r, g, b, a, kelvin, duration))
		}

		else if (data.hue != null && data.saturation != null && data.brightness != null) {
			const hue = getNumber('hue', data)
			const saturation = getNumber('saturation', data)
			const brightness = getNumber('brightness', data)

			if (hue != null && saturation != null && brightness != null)
				return this.json(await device.setHSB({ hue, saturation, brightness, kelvin }, duration))
		}

		return this.badRequest()
	}
}


// if (data.css) {
// 		const css = this.parseString(data.css)
// 		const kelvin = this.parseNumber(data.kelvin)
// 		if (css)
// 			return device.setCSS(css, kelvin)
// 	}
// 	else if (data.r != null && data.g != null && data.b != null) {

// 	}
// 	return null
// }
//
// private async respondToDeviceTemperaturePost(device: LifxDevice, data: { [key: string]: any }) {
// 	const color = await device.getColor()
// 	const kelvin = this.parseNumber(data.kelvin)
// 	if (color && kelvin != null)
// 		return device.setColor({
// 			...color,
// 			kelvin
// 		})
// 	return null
// }
