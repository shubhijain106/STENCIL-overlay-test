import filter from 'lodash/filter';
import get from 'lodash/get';
import has from 'lodash/has';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import {
	addEventListenerOnElement,
	createElementWithClass,
	elementExists,
	getElement,
	removeFromContainer,
} from './aw-utils';
import { Key } from './key.enum';
import { WindowEventMap } from './window-event-map.enum';
import { eventPath } from './event-path.polyfill';
import { AwDynamicPosition } from './dynamic-position';
import {
	AwDynamicPositionEnum,
	DefaultFlipOrder,
} from './dynamic-position.enum';
import {
	AwOverlayControllerOptionsModifiers,
	MouseCoordinates,
} from './dynamic-position.interface';
import {
	AwOverlayControllerOptionsInterface,
	AwOverlayControllerSourceElementOptionsInterface,
	AwOverlayControllerTargetElementOptionsInterface,
} from './overlay-controller-options.interface';
import { AwOverlayTriggerEnum } from './overlay-trigger.enum';
import { AwPositionConstants } from './position.constants';

const {
	OVERLAY_SOURCE,
	CLASSNAME,
	OVERLAY_CONTAINER,
	PARENT_CLASS_NAME,
	STYLE,
	NONE,
	PARENT,
} = AwPositionConstants.STRING;

export class AwOverlayController {
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
		this.create();
	}

	private _onHoverInside: any;
	private _onHoverOutside: any;
	private _hoverOutTimeout: any;
	private _hoverInTimeout: any;
	private _closePopover: any;
	private _clickedOutside: any;
	private _openOverlay: any;
	private _updateOnViewportChange: any;
	private _escapeKeyHandler: any;

	public create(): AwOverlayController {
		if (
			this.sourceElement &&
			this.targetElement &&
			this.parentElement &&
			this.updateStateCallback
		) {
			this.init();
		}
		return this;
	}

	public updatePosition(): AwOverlayController {
		if (!this.isOpen()) {
			this.open();
		}
		if (
			get(this.options, 'modifiers.isOnCursorPosition') &&
			has(this.options, 'getMouseCoordinatesCallback')
		) {
			const mouseCoordinates = this.options.getMouseCoordinatesCallback();
			this.renderOverlayWithMousePosition(mouseCoordinates);
		} else {
			this.renderOverlayWithPosition();
		}
		return this;
	}

	/**
	 * Handles opening overlay
	 */
	public open(event?: Event): void {
		let shouldOpen = true;
		if (has(this.options, 'shouldOpenCallback')) {
			shouldOpen = this.options.shouldOpenCallback();
		}
		if (!this.isOpen() && shouldOpen) {
			if (event) {
				event.stopPropagation();
			}
			// Close other open overlays before opening the current overlay
			map(this.options.overlaysToClose, containerClassName =>
				this.closeAllOverlays(containerClassName)
			);

			this.updateStateCallback(true);
		}
	}

	public openOverlayWithPosition(): void {
		this.openOverlayContainer();
		this.handleClosingOnEscape();
		this._clickedOutside = this.onClickOutside.bind(this);
		document.addEventListener(
			WindowEventMap.mousedown,
			this._clickedOutside
		);
	}

	private handleClosingOnEscape() {
		this._escapeKeyHandler = this.escapeKeyHandler.bind(this);
		document.addEventListener(
			WindowEventMap.keydown,
			this._escapeKeyHandler
		);
	}

	private escapeKeyHandler(event: KeyboardEvent): void {
		if (event.keyCode == Key.Escape) {
			this.close();
		}
	}

	private removeEscapeListener(): void {
		document.removeEventListener(
			WindowEventMap.keydown,
			this._escapeKeyHandler
		);
	}

	/**
	 * Handles closing overlay
	 */
	public close(): void {
		let shouldClose = true;
		if (has(this.options, 'shouldCloseCallback')) {
			shouldClose = this.options.shouldCloseCallback();
		}
		// Check if there are flyout menus / child overlays open
		const isChildOverlayOpen: boolean =
			has(this.options, 'isChildOverlayOpenCallback') &&
			this.options.isChildOverlayOpenCallback();
		if (!isChildOverlayOpen && this.isOpen() && shouldClose) {
			this.closeOverlayContainer();
			if (this.sourceElement) {
				this.parentElement.appendChild(this.sourceElement);
				document.removeEventListener(
					WindowEventMap.mousedown,
					this._clickedOutside
				);
				this.removeEscapeListener();
			}
			this.updateStateCallback(false);
		}
	}

	private init() {
		this.initOptions();
		this.initTargetElement();
		this.initSourceElement();
		this.viewportChangeHandler();
	}

	private initOptions(): void {
		const DEFAULT_OPTIONS = {
			trigger: AwOverlayTriggerEnum.PRESSED,
			hoverInTimeout: 150,
			overlaysToClose: [],
			shouldOpenCallback: () => true,
		};
		this.options = Object.assign(
			{},
			DEFAULT_OPTIONS,
			this.options,
			this.initModifiers(),
			this.initSourceElementOptions(),
			this.initTargetElementOptions()
		) as AwOverlayControllerOptionsInterface;
	}

	private initModifiers(): {
		modifiers: AwOverlayControllerOptionsModifiers;
	} {
		const { BOTTOM_CENTER } = AwDynamicPositionEnum;
		const DEFAULT_MODIFIERS: AwOverlayControllerOptionsModifiers = {
			isOnCursorPosition: false,
			flipOrder: DefaultFlipOrder,
			defaultPlacement: BOTTOM_CENTER,
			padding: 0,
		};
		return {
			modifiers: Object.assign(
				{},
				DEFAULT_MODIFIERS,
				this.options.modifiers
			),
		};
	}
	private initSourceElementOptions(): {
		sourceElementOptions: AwOverlayControllerSourceElementOptionsInterface;
	} {
		const DEFAULT_OPTIONS: AwOverlayControllerSourceElementOptionsInterface = {
			overlayClassName: OVERLAY_SOURCE,
		};
		return {
			sourceElementOptions: Object.assign(
				{},
				DEFAULT_OPTIONS,
				this.options.sourceElementOptions
			),
		};
	}
	private initTargetElementOptions(): {
		targetElementOptions: AwOverlayControllerTargetElementOptionsInterface;
	} {
		const DEFAULT_OPTIONS: AwOverlayControllerTargetElementOptionsInterface = {
			targetForEventListeners: this.targetElement,
			targetEventType: [WindowEventMap.mousedown],
		};
		return {
			targetElementOptions: Object.assign(
				{},
				DEFAULT_OPTIONS,
				this.options.targetElementOptions
			),
		};
	}

	/**
	 * Initialize source element which will be opened as a overlay.
	 */
	private initSourceElement(): void {
		this.sourceElement.classList.add(OVERLAY_SOURCE);
		this.sourceElement.style.display = NONE;
		this.sourceElement['hostRef'] = this.host;
		if (this.options.trigger === AwOverlayTriggerEnum.HOVER) {
			this.sourceElement.addEventListener(
				WindowEventMap.mouseover,
				this._onHoverInside
			);
			this.sourceElement.addEventListener(
				WindowEventMap.mouseout,
				this._onHoverOutside
			);
		}

		const sourceElementOptions = this.options.sourceElementOptions;
		if (sourceElementOptions) {
			map(sourceElementOptions.addClassNames, name =>
				this.sourceElement.classList.add(name)
			);
		}
	}

	/**
	 * Initialize target element which will trigger opening overlay.
	 */
	private initTargetElement(): void {
		if (this.options.targetElementOptions.targetForEventListeners) {
			switch (this.options.trigger) {
				case AwOverlayTriggerEnum.HOVER:
					this.hoverTriggerHandler(
						this.options.targetElementOptions
							.targetForEventListeners
					);
					break;

				case AwOverlayTriggerEnum.PRESSED:
					this.pressedTriggerHandler(
						this.options.targetElementOptions
							.targetForEventListeners
					);
					break;
			}
		}

		const targetElementOptions = this.options.targetElementOptions;
		if (targetElementOptions) {
			map(targetElementOptions.addClassNames, name =>
				this.targetElement.classList.add(name)
			);
		}

		const targetElementEvents = get(
			this.options.targetElementOptions,
			'targetEventsMap'
		);
		if (targetElementEvents) {
			this.customEventsHandler(
				this.options.targetElementOptions.targetForEventListeners,
				targetElementEvents
			);
		}
	}

	private customEventsHandler(
		targetForEventListeners: HTMLElement | SVGElement,
		targetEventsMap: Map<WindowEventMap, Function>
	): void {
		targetEventsMap.forEach((value: any, key: string) => {
			addEventListenerOnElement(targetForEventListeners, key, value);
		});
	}

	private hoverTriggerHandler(targetForEventListeners): void {
		this._onHoverInside = this.onHoverInside.bind(this);
		this._onHoverOutside = this.onHoverOutside.bind(this);
		addEventListenerOnElement(
			targetForEventListeners,
			WindowEventMap.mouseover,
			this._onHoverInside
		);
		addEventListenerOnElement(
			targetForEventListeners,
			WindowEventMap.mouseout,
			this._onHoverOutside
		);
	}

	private pressedTriggerHandler(targetForEventListeners): void {
		this._openOverlay = this.open.bind(this);
		if (
			this.options.targetElementOptions.targetEventType.includes(
				WindowEventMap.click
			)
		) {
			addEventListenerOnElement(
				targetForEventListeners,
				WindowEventMap.click,
				this._openOverlay
			);
		} else if (
			this.options.targetElementOptions.targetEventType.includes(
				WindowEventMap.mousedown
			)
		) {
			addEventListenerOnElement(
				targetForEventListeners,
				WindowEventMap.mousedown,
				this._openOverlay
			);
		}
	}

	private viewportChangeHandler() {
		this._updateOnViewportChange = this.updateOnViewportChange.bind(this);
		window.addEventListener(
			WindowEventMap.scroll,
			this._updateOnViewportChange,
			true
		);
		window.addEventListener(
			WindowEventMap.resize,
			this._updateOnViewportChange
		);
	}

	/**
	 * On window resize and scroll, update the position of popover
	 */

	private updateOnViewportChange(): void {
		if (this.isOpen()) {
			if (
				get(this.options, 'modifiers.isOnCursorPosition') &&
				has(this.options, 'getMouseCoordinatesCallback')
			) {
				const mouseCoordinates = this.options.getMouseCoordinatesCallback();
				this.renderOverlayWithMousePosition(mouseCoordinates);
			} else {
				this.renderOverlayWithPosition();
			}
		}
	}

	/**
	 * Updates popover element's position based on viewport
	 */
	private renderOverlayWithPosition(): void {
		if (this.sourceElement && this.targetElement) {
			const position = new AwDynamicPosition(
				this.options.modifiers,
				this.sourceElement,
				this.targetElement
			);
			if (this.updatePositionCallback) {
				this.updatePositionCallback(position);
			}
		}
	}

	/**
	 * Updates popover element's position based on mouse Coordinates
	 */
	public renderOverlayWithMousePosition(
		mouseCoordinates: MouseCoordinates
	): void {
		const NEW_MOUSE_MODIFIERS: AwOverlayControllerOptionsModifiers = {
			isOnCursorPosition: true,
			mouseCoordinates: {
				mouseX: mouseCoordinates.mouseX,
				mouseY: mouseCoordinates.mouseY,
			},
		};
		if (!isEmpty(mouseCoordinates)) {
			this.options.modifiers = Object.assign(
				{},
				this.options.modifiers,
				NEW_MOUSE_MODIFIERS
			);
			if (this.sourceElement && this.targetElement) {
				const position = new AwDynamicPosition(
					this.options.modifiers,
					this.sourceElement,
					this.targetElement
				);
				if (this.updatePositionCallback) {
					this.updatePositionCallback(position);
				}
			}
		}
	}

	/**
	 * Open overlay when target is hovered inside
	 */
	private onHoverInside(): void {
		window.clearTimeout(this._hoverOutTimeout);
		this._openOverlay = this.open.bind(this);
		this._hoverInTimeout = window.setTimeout(
			this._openOverlay,
			this.options.hoverInTimeout
		);
	}
	/**
	 * Close overlay when target is hovered outside
	 */
	private onHoverOutside(): void {
		window.clearTimeout(this._hoverInTimeout);
		this._closePopover = this.close.bind(this);
		this._hoverOutTimeout = window.setTimeout(this._closePopover, 150);
	}

	/**
	 * Handle click on anywhere in document. If click is not inside overlay, close all popovers.
	 */
	private onClickOutside(event: Event): void {
		if (this.isOutsideOverlayCallback) {
			if (this.isOutsideOverlayCallback(event)) {
				this.close();
			}
		} else if (this.defaultIsOutsideOverlay(event)) {
			this.close();
		}
	}

	/**
	 * Determine if click is inside or outside popover
	 */
	private defaultIsOutsideOverlay(event: Event): boolean {
		const classMap = map(eventPath(event), CLASSNAME);
		return isEmpty(
			filter(classMap, value =>
				includes(
					value,
					get(this.options, 'sourceElementOptions.overlayClassName')
				)
			)
		);
	}

	public isOpen(
		element: HTMLElement | SVGElement = this.sourceElement
	): boolean {
		return get(element, PARENT) && element.style.top ? true : false;
	}

	public openOverlayContainer(): void {
		if (get(this.sourceElement, PARENT_CLASS_NAME) === OVERLAY_CONTAINER) {
			return;
		} else if (this.sourceElement) {
			this.appendToContainer(this.sourceElement);
			this.sourceElement.removeAttribute(STYLE);
		}
		if (
			get(this.options, 'modifiers.isOnCursorPosition') &&
			has(this.options, 'getMouseCoordinatesCallback')
		) {
			const mouseCoordinates = this.options.getMouseCoordinatesCallback();
			this.renderOverlayWithMousePosition(mouseCoordinates);
		} else {
			this.renderOverlayWithPosition();
		}
	}

	public closeOverlayContainer(): void {
		const parentElement = get(this.sourceElement, PARENT);
		if (parentElement) {
			this.sourceElement.removeAttribute(STYLE);
			this.sourceElement.style.display = NONE;
			removeFromContainer(this.sourceElement);
		}
	}

	public createOverlayContainer(
		containerClassName: string = OVERLAY_CONTAINER
	): void {
		if (!elementExists(containerClassName)) {
			document.body.appendChild(
				createElementWithClass(containerClassName)
			);
		}
	}

	public appendToContainer(
		element: Element,
		containerClassName: string = OVERLAY_CONTAINER
	): void {
		if (elementExists(containerClassName)) {
			getElement(containerClassName).appendChild(element);
		} else {
			getElement(OVERLAY_CONTAINER).appendChild(
				createElementWithClass(containerClassName)
			);
			this.appendToContainer(element, containerClassName);
		}
	}

	/**
	 * Handle closing all overlays anywhere in document
	 */
	private closeAllOverlays(
		containerClassName: string = OVERLAY_CONTAINER
	): void {
		let elements = Array.from(
			document.getElementsByClassName(containerClassName)
		);
		if (elements[0]) {
			map(elements[0].children, (value: any) => {
				if (value.hostRef && this.host !== value.hostRef)
					value.hostRef.close();
			});
		}
	}
}
