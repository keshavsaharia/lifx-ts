import LifxRequest from '../request'

import {
	Request
} from '../interface'

import {
	getString,
	getNumber
} from '../util'

import {
	DeviceGroup,
	HSBColor
} from '../../../interface'

import {
	CSStoHSB,
	RGBtoHSB
} from '../../../util'

export default class LifxGroupColorRequest extends LifxRequest<DeviceGroup> {

	async respond({ data }: Request, group: DeviceGroup) {
		if (! data)
			return this.badRequest()

		const css = getString('css', data)
		const kelvin = getNumber('kelvin', data)
		const duration = getNumber('duration', data)

		if (css)
			return this.json(await this.sendAll(group, CSStoHSB(css)))

		if (data.r != null && data.g != null && data.b != null) {
			const r = getNumber('r', data)
			const g = getNumber('g', data)
			const b = getNumber('b', data)
			const a = getNumber('a', data)

			if (r != null && g != null && b != null)
				return this.json(await this.sendAll(group, RGBtoHSB(r, g, b, a)))
		}

		if (data.hue != null && data.saturation != null && data.brightness != null) {
			const hue = getNumber('hue', data)
			const saturation = getNumber('saturation', data)
			const brightness = getNumber('brightness', data)

			if (hue != null && saturation != null && brightness != null)
				return this.json(await this.sendAll(group, { hue, saturation, brightness, kelvin }, duration))
		}

		return this.badRequest()
	}

	private async sendAll(group: DeviceGroup, color: HSBColor, duration?: number) {
		return Promise.all(this.client.getGroup(group)
			.map((device) => device.setHSB(color, duration)))
	}
}
