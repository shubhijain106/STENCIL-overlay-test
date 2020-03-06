import { WindowEventMap } from './window-event-map.enum';

export type AwOverlayControllerOptionsTargetEventType =
	| WindowEventMap.click
	| WindowEventMap.mousedown
	| WindowEventMap.mouseover
	| WindowEventMap.mouseout;
