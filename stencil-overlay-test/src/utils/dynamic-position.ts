import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import lowerCase from 'lodash/lowerCase';
import {
	AwDynamicPositionEnum,
	DefaultFlipOrder,
} from './dynamic-position.enum';
import {
	AwOverlayControllerOptionsModifiers,
	Boundaries,
} from './dynamic-position.interface';
import { AwPositionConstants } from './position.constants';

export class AwDynamicPosition {
	public xPos: number = 0;
	public yPos: number = 0;
	public position: AwDynamicPositionEnum;
	constructor(
		public modifiers: AwOverlayControllerOptionsModifiers,
		public source: HTMLElement | SVGElement,
		public target: HTMLElement | SVGElement
	) {
		this.modifiers = Object.assign(
			{},
			{
				isOnCursorPosition: false,
				flipOrder: DefaultFlipOrder,
				defaultPlacement: AwDynamicPositionEnum.BOTTOM_CENTER,
				mouseCoordinates: null,
				padding: 0,
				viewportPadding: 5,
				scrollToFit: false,
			},
			this.modifiers
		);
		this.updatePosition();
	}

	private padding: number;
	private viewportBoundaries: Boundaries;
	private sourceElBoundingRect;
	private targetElBoundingRect;

	public getPositionClass(baseClass: string): string {
		if (this.position) {
			const splitArr = lowerCase(this.position).split(' ');
			return `${baseClass}--${`${splitArr[0].toLowerCase()}-${splitArr[1].toLowerCase()}`}`;
		}
	}

	private getElementsBoundingClientRect(element): ClientRect | DOMRect {
		if (element) {
			const shadowRootElement: Element = Array.from(
				get(element, 'shadowRoot.children') || []
			)
				.filter(elm => get(elm, 'nodeName') !== 'STYLE')
				.pop() as any;

			if (shadowRootElement) {
				return shadowRootElement.getBoundingClientRect();
			}
			return element.getBoundingClientRect();
		}
	}

	private updatePosition(): void {
		this.sourceElBoundingRect = this.getElementsBoundingClientRect(
			this.source
		);
		this.targetElBoundingRect = this.modifiers.isOnCursorPosition
			? this.getMouseBoundingClientRect()
			: this.getElementsBoundingClientRect(this.target);
		this.viewportBoundaries = this.getViewPortBoundaries();
		if (isFunction(this.modifiers.padding)) {
			this.padding = this.modifiers.padding() || 0;
		} else {
			this.padding = this.modifiers.padding ? this.modifiers.padding : 0;
		}
		this.determinePosition(
			this.modifiers.flipOrder,
			this.modifiers.defaultPlacement
		);

		this.setPosition();
	}

	private determinePosition(
		flipOrder: Array<AwDynamicPositionEnum>,
		defaultPlacement: AwDynamicPositionEnum
	): { left: number; top: number } {
		let pos: AwDynamicPositionEnum = defaultPlacement;
		let overflows: boolean = true;
		const defaultPlacementIsValid: boolean = this.isPositionValid(
			defaultPlacement
		);
		if (defaultPlacementIsValid) {
			overflows = false;
		} else {
			for (let flipPos of flipOrder) {
				if (this.isPositionValid(flipPos)) {
					pos = <AwDynamicPositionEnum>flipPos;
					overflows = false;
					break;
				}
			}
		}
		//when none of the scenarios satisfy
		// show overlay container in default position with scroll
		if (overflows) {
			this.isPositionValid(defaultPlacement);
			console.warn('not enough space');
		}
		this.position = pos;
		return { left: this.xPos, top: this.yPos };
	}

	public setPosition(): void {
		if (this.source) {
			this.source.style.top = `${this.yPos / 16}rem`;
			this.source.style.left = `${this.xPos / 16}rem`;

			// If there are more menu items than we can display on screen (in other words if menu overflows), then we add a scroll to the menu
			if (this.modifiers.scrollToFit) {
				// Resetting height to 'auto'
				this.source.style.height = 'auto';
				this.source.style.bottom = 'unset';

				const { BOTTOM_PADDING } = AwPositionConstants.STRING;
				const visibleHeightOffset =
					window.innerHeight - this.yPos - BOTTOM_PADDING;
				if (
					this.source.getBoundingClientRect().height >=
					visibleHeightOffset
				) {
					this.source.style.overflowY = 'auto';
					this.source.style.bottom = `${BOTTOM_PADDING / 16}rem`;
					this.source.style.height = `${visibleHeightOffset / 16}rem`;
				}
			}
		}
	}

	private getViewPortBoundaries(): Boundaries {
		let boundaries = {
			left: 0,
			right: window.innerWidth || document.documentElement.clientWidth,
			top: 0,
			bottom: window.innerHeight || document.documentElement.clientHeight,
		};

		// Add paddings
		let padding = this.modifiers.viewportPadding || 0;
		boundaries.left += padding;
		boundaries.top += padding;
		boundaries.right -= padding;
		boundaries.bottom -= padding;
		return boundaries;
	}

	private getMouseBoundingClientRect(): any {
		if (this.modifiers.mouseCoordinates) {
			let x = this.modifiers.mouseCoordinates.mouseX;
			let y = this.modifiers.mouseCoordinates.mouseY;
			return {
				left: x,
				top: y,
				width: 0,
				height: 0,
			};
		}
	}

	private isValid(): boolean {
		let bounds = {
			left: this.xPos,
			right: this.xPos + this.sourceElBoundingRect.width,
			top: this.yPos,
			bottom: this.yPos + this.sourceElBoundingRect.height,
		};
		return this.isElementInViewport(bounds) ? true : false;
	}

	//hide/not show source when target is out of viewport
	//hide Element when source is of viewport
	private isElementInViewport(element: any): boolean {
		return element.top >= this.viewportBoundaries.top &&
			element.top <= this.viewportBoundaries.bottom &&
			element.bottom <= this.viewportBoundaries.bottom &&
			element.bottom >= this.viewportBoundaries.top &&
			element.left >= this.viewportBoundaries.left &&
			element.left <= this.viewportBoundaries.right &&
			element.right <= this.viewportBoundaries.right &&
			element.right >= this.viewportBoundaries.left
			? true
			: false;
	}

	private isPositionValid(position: AwDynamicPositionEnum): boolean {
		const {
			BOTTOM_CENTER,
			BOTTOM_LEFT,
			BOTTOM_RIGHT,
			TOP_CENTER,
			TOP_LEFT,
			TOP_RIGHT,
			LEFT_BOTTOM,
			LEFT_CENTER,
			LEFT_TOP,
			RIGHT_BOTTOM,
			RIGHT_CENTER,
			RIGHT_TOP,
		} = AwDynamicPositionEnum;
		switch (position) {
			case BOTTOM_CENTER:
				this.xPos =
					this.targetElBoundingRect.left +
					this.targetElBoundingRect.width / 2 -
					this.sourceElBoundingRect.width / 2;
				this.yPos =
					this.targetElBoundingRect.top +
					this.targetElBoundingRect.height +
					this.padding;
				return this.isValid();

			case BOTTOM_LEFT:
				this.xPos = this.targetElBoundingRect.left;
				this.yPos =
					this.targetElBoundingRect.top +
					this.targetElBoundingRect.height +
					this.padding;
				return this.isValid();

			case BOTTOM_RIGHT:
				this.xPos =
					this.targetElBoundingRect.left +
					this.targetElBoundingRect.width -
					this.sourceElBoundingRect.width;
				this.yPos =
					this.targetElBoundingRect.top +
					this.targetElBoundingRect.height +
					this.padding;
				return this.isValid();

			case TOP_CENTER:
				this.xPos =
					this.targetElBoundingRect.left +
					this.targetElBoundingRect.width / 2 -
					this.sourceElBoundingRect.width / 2;
				this.yPos =
					this.targetElBoundingRect.top -
					this.sourceElBoundingRect.height -
					this.padding;
				return this.isValid();
			case TOP_LEFT:
				this.xPos = this.targetElBoundingRect.left;
				this.yPos =
					this.targetElBoundingRect.top -
					this.sourceElBoundingRect.height -
					this.padding;
				return this.isValid();

			case TOP_RIGHT:
				this.xPos =
					this.targetElBoundingRect.left +
					this.targetElBoundingRect.width -
					this.sourceElBoundingRect.width;
				this.yPos =
					this.targetElBoundingRect.top -
					this.sourceElBoundingRect.height -
					this.padding;
				return this.isValid();

			case RIGHT_BOTTOM:
				this.xPos =
					this.targetElBoundingRect.left -
					(this.sourceElBoundingRect.width + this.padding);
				this.yPos =
					this.targetElBoundingRect.top +
					this.targetElBoundingRect.height -
					this.sourceElBoundingRect.height;
				return this.isValid();

			case RIGHT_TOP:
				this.xPos =
					this.targetElBoundingRect.left -
					(this.sourceElBoundingRect.width + this.padding);
				this.yPos = this.targetElBoundingRect.top;
				return this.isValid();

			case RIGHT_CENTER:
				this.xPos =
					this.targetElBoundingRect.left -
					(this.sourceElBoundingRect.width + this.padding);
				this.yPos =
					this.targetElBoundingRect.top +
					this.targetElBoundingRect.height / 2 -
					this.sourceElBoundingRect.height / 2;
				return this.isValid();

			case LEFT_BOTTOM:
				this.xPos =
					this.targetElBoundingRect.left +
					(this.targetElBoundingRect.width + this.padding);
				this.yPos =
					this.targetElBoundingRect.top +
					this.targetElBoundingRect.height -
					this.sourceElBoundingRect.height;
				return this.isValid();

			case LEFT_TOP:
				this.xPos =
					this.targetElBoundingRect.left +
					(this.targetElBoundingRect.width + this.padding);
				this.yPos = this.targetElBoundingRect.top;
				return this.isValid();

			case LEFT_CENTER:
				this.xPos =
					this.targetElBoundingRect.left +
					(this.targetElBoundingRect.width + this.padding);
				this.yPos =
					this.targetElBoundingRect.top +
					this.targetElBoundingRect.height / 2 -
					this.sourceElBoundingRect.height / 2;
				return this.isValid();

			default:
				return false;
		}
	}
}
