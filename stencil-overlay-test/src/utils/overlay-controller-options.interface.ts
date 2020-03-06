import { WindowEventMap } from './window-event-map.enum';
import { AwOverlayControllerOptionsModifiers } from './dynamic-position.interface';
import { AwOverlayControllerOptionsTargetEventType } from './overlay-controller-options-target-event.type';
import { AwOverlayTriggerEnum } from './overlay-trigger.enum';

export interface AwOverlayControllerBaseInterface {
	/**
	 * List of css class names to be added to the element
	 *
	 * @type {Array<string}
	 */
	addClassNames?: Array<string>;
}

export interface AwOverlayControllerSourceElementOptionsInterface
	extends AwOverlayControllerBaseInterface {
	/**
	 * Default overlay class name for the source element. This class is responsible for all the dynamic positioning logic.
	 * When overlayClassName is different than the default value then you must create all the position css class.
	 *
	 * @type {string}
	 * @default 'aw-overlay__source'
	 */
	overlayClassName?: string;
}

export interface AwOverlayControllerTargetElementOptionsInterface
	extends AwOverlayControllerBaseInterface {
	/**
	 * Pass the reference of the element on which all the event listeners should be attached. By default, event listeners are attached on the targetElement.
	 *
	 * @type {HTMLElement | SVGElement}
	 */
	targetForEventListeners?: HTMLElement | SVGElement;

	/**
	 * List of valid event triggers that can be applied to the target element.
	 * Use this prop to add or remove any triggers from the target element.
	 *
	 * @type {Array<AwOverlayControllerOptionsTargetEventType>}
	 */
	targetEventType?: Array<AwOverlayControllerOptionsTargetEventType>;

	/**
	 * Map of custom event triggers that can be applied to the target element.
	 * Use this prop to add any custom event to the target element.
	 *
	 * @type {Map<WindowEventMap, Function>}
	 */
	targetEventsMap?: Map<WindowEventMap, Function>;
}

export interface AwOverlayControllerOptionsInterface {
	/**
	 * Determines type of action that will open the overlay
	 *
	 * @type {AwOverlayTriggerEnum}
	 * @default AwOverlayTriggerEnum.PRESSED
	 */
	trigger?: AwOverlayTriggerEnum;

	/**
	 * Determines the time after which hover on an element would open up the overlay
	 *
	 * @type {number}
	 * @default 150
	 */

	hoverInTimeout?: number;

	/**
	 * Modifiers to control dynamic positioning
	 * @type {Modifiers}
	 */
	modifiers?: AwOverlayControllerOptionsModifiers;

	/**
	 * Configuration options for source element
	 *
	 * @type {AwOverlayControllerSourceElementOptionsInterface}
	 */
	sourceElementOptions?: AwOverlayControllerSourceElementOptionsInterface;

	/**
	 * Configuration options for source element
	 *
	 * @type {AwOverlayControllerTargetElementOptionsInterface}
	 */
	targetElementOptions?: AwOverlayControllerTargetElementOptionsInterface;

	/**
	 * Callback function to check if there are any flyout menus / child overlays open.
	 * When true, would prevent the main overlay from closing on mouse out.
	 *
	 * @type {Function}
	 */
	isChildOverlayOpenCallback?: Function;

	/**
	 * Callback function when returns false than the overlay would not be opened.
	 * Function default returns to true
	 *
	 * @type {Function}
	 * @returns {boolean}
	 */
	shouldOpenCallback?: Function;

	/**
	 * Callback function when returns false than the overlay would not be closed.
	 * Function default returns to true
	 *
	 * @type {Function}
	 * @returns {boolean}
	 */
	shouldCloseCallback?: Function;

	/**
	 * Callback function which returns mouseCoordinates required to open the overlay item.
	 * Function default returns to (0,0)
	 *
	 * @type {Function}
	 * @returns {boolean}
	 */
	getMouseCoordinatesCallback?: Function;

	/**
	 * List of overlay class names to close before opening current overlay.
	 *
	 * @type {Array<string>}
	 * @default undefined
	 */
	overlaysToClose?: Array<string>;
}
