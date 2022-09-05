import {
	LifxDevice
} from '../../..'

import LifxRequest from '../request'

import {
	Request,
	RequestData
} from '../interface'

import {
	isString,
	parseNumber
} from '../../../util'

export default class LifxDeviceColorRequest extends LifxRequest<LifxDevice> {

	async respond({ data }: Request, device: LifxDevice) {
		if (! data)
			return this.notFound()

		if (isString(data.css))
			return this.json(await device.setCSS(data.css, parseNumber(data.kelvin)))

		if (data.r != null && data.g != null && data.b != null) {
			const r = parseNumber(data.r)
			const g = parseNumber(data.g)
			const b = parseNumber(data.b)
			const a = parseNumber(data.a)
			const kelvin = parseNumber(data.kelvin)

			if (r != null && g != null && b != null)
				return this.json(await device.setRGB(r, g, b, a, kelvin))
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
