export enum AwDynamicPositionEnum {
	BOTTOM_CENTER = 'bottomCenter',
	BOTTOM_LEFT = 'bottomLeft',
	BOTTOM_RIGHT = 'bottomRight',

	TOP_CENTER = 'topCenter',
	TOP_LEFT = 'topLeft',
	TOP_RIGHT = 'topRight',

	LEFT_CENTER = 'leftCenter',
	LEFT_TOP = 'leftTop',
	LEFT_BOTTOM = 'leftBottom',

	RIGHT_CENTER = 'rightCenter',
	RIGHT_TOP = 'rightTop',
	RIGHT_BOTTOM = 'rightBottom',
}
export const DefaultFlipOrder = [
	AwDynamicPositionEnum.BOTTOM_CENTER,
	AwDynamicPositionEnum.BOTTOM_LEFT,
	AwDynamicPositionEnum.BOTTOM_RIGHT,
	AwDynamicPositionEnum.TOP_CENTER,
	AwDynamicPositionEnum.TOP_LEFT,
	AwDynamicPositionEnum.TOP_RIGHT,
	AwDynamicPositionEnum.LEFT_CENTER,
	AwDynamicPositionEnum.LEFT_TOP,
	AwDynamicPositionEnum.LEFT_BOTTOM,
	AwDynamicPositionEnum.RIGHT_CENTER,
	AwDynamicPositionEnum.RIGHT_TOP,
	AwDynamicPositionEnum.RIGHT_BOTTOM,
];
export const DefaultTooltipFlipOrder = [
	AwDynamicPositionEnum.BOTTOM_LEFT,
	AwDynamicPositionEnum.BOTTOM_RIGHT,
	AwDynamicPositionEnum.TOP_LEFT,
	AwDynamicPositionEnum.TOP_RIGHT,
	AwDynamicPositionEnum.LEFT_TOP,
	AwDynamicPositionEnum.LEFT_BOTTOM,
	AwDynamicPositionEnum.RIGHT_TOP,
	AwDynamicPositionEnum.RIGHT_BOTTOM,
];
