// Base request class
import LifxRequest from './request'

// Routers
import LifxAppRouter from './router/app'
import LifxDeviceRouter from './router/device'
import LifxGroupRouter from './router/group'

// Device request handlers
import LifxDeviceRequest from './device/device'
import LifxDevicePowerRequest from './device/power'
import LifxDeviceColorRequest from './device/color'
import LifxDeviceLightRequest from './device/light'
import LifxDeviceTemperatureRequest from './device/temperature'
import LifxDeviceLabelRequest from './device/label'
import LifxDeviceGroupRequest from './device/group'
import LifxDeviceLocationRequest from './device/location'

// Group request handlers
import LifxGroupRequest from './group/group'
import LifxGroupPowerRequest from './group/power'
import LifxGroupColorRequest from './group/color'
import LifxGroupTemperatureRequest from './group/temperature'

// Static paths
import LifxHomeRequest from './static/home'
import LifxFaviconRequest from './static/favicon'

export {
	LifxRequest,
	LifxAppRouter,
	LifxDeviceRouter,
	LifxGroupRouter,

	LifxDeviceRequest,
	LifxDevicePowerRequest,
	LifxDeviceColorRequest,
	LifxDeviceLightRequest,
	LifxDeviceTemperatureRequest,
	LifxDeviceLabelRequest,
	LifxDeviceGroupRequest,
	LifxDeviceLocationRequest,

	LifxGroupRequest,
	LifxGroupPowerRequest,
	LifxGroupColorRequest,
	LifxGroupTemperatureRequest,

	LifxHomeRequest,
	LifxFaviconRequest
}
