import { AwDynamicPositionEnum } from './dynamic-position.enum';

export type NumberCallback = () => number;

export interface AwOverlayControllerOptionsModifiers {
	isOnCursorPosition?: boolean;
	flipOrder?: Array<AwDynamicPositionEnum>;
	defaultPlacement?: AwDynamicPositionEnum;
	mouseCoordinates?: MouseCoordinates;
	padding?: number | NumberCallback;
	viewportPadding?: number;
	scrollToFit?: boolean;
}

export interface Boundaries {
	top: number;
	bottom: number;
	left: number;
	right: number;
}
export interface MouseCoordinates {
	mouseX: number;
	mouseY: number;
}

export interface PositionElements {
	targetElement: HTMLElement | SVGElement;
	sourceElement: HTMLElement | SVGElement;
}
