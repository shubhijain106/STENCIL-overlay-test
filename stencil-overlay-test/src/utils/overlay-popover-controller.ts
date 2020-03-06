import filter from 'lodash/filter';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { eventPath } from './event-path.polyfill';
import { AwOverlayController } from './overlay-controller';
import { AwOverlayControllerOptionsInterface } from './overlay-controller-options.interface';
import { AwPositionConstants } from './position.constants';
const { POPOVER_CONTAINER, CLASSNAME } = AwPositionConstants.STRING;

export class AwOverlayPopoverController extends AwOverlayController {
	constructor(
		public host: HTMLElement | SVGElement,
		public parentElement: HTMLElement | SVGElement,
		public targetElement: HTMLElement | SVGElement,
		public sourceElement: HTMLElement | SVGElement,
		public updateStateCallback: Function,
		public options: AwOverlayControllerOptionsInterface = {},
		public isOutsideOverlayCallback?: Function,
		public updatePositionCallback?: Function
	) {
		super(
			host,
			parentElement,
			targetElement,
			sourceElement,
			updateStateCallback,
			options,
			isOutsideOverlayCallback,
			updatePositionCallback
		);
	}

	public appendToContainer(element: Element): void {
		super.createOverlayContainer();
		super.appendToContainer(element, POPOVER_CONTAINER);
	}

	public isOutsidePopoverController(
		event: Event,
		className: string
	): boolean {
		const {
			MENU_CONTAINER,
			DROPDOWN_CONTAINER,
		} = AwPositionConstants.STRING;
		const classMap = map(eventPath(event), CLASSNAME);
		const dropdownController = isEmpty(
			filter(classMap, value => includes(value, DROPDOWN_CONTAINER))
		);
		const menuController = isEmpty(
			filter(classMap, value => includes(value, MENU_CONTAINER))
		);
		const popoverController = isEmpty(
			filter(classMap, value => includes(value, className))
		);
		return dropdownController && menuController && popoverController;
	}
}
