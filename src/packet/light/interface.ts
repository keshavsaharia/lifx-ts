export interface HSBColor {
	hue: number
	saturation: number
	brightness: number
	kelvin?: number
}

export interface LightColor extends HSBColor {
	kelvin: number
}

export interface LightState extends LightColor {
	power: number
	label: string
}

export interface LightPower {
	level: number
}

export interface LightInfrared {
	brightness: number
}
