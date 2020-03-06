import {
	Component,
	Element,
	Event,
	EventEmitter,
	h,
	JSX,
	Method,
	Prop,
	Watch,
} from '@stencil/core';
import filter from 'lodash/filter';
import get from 'lodash/get';
import lowerCase from 'lodash/lowerCase';
import map from 'lodash/map';
import startsWith from 'lodash/startsWith';
import {
	AwDynamicPosition,
	AwDynamicPositionEnum,
	AwOverlayControllerTargetElementOptionsInterface,
	AwOverlayPopoverController,
	AwOverlayTriggerEnum,
	AwPositionConstants,
	DefaultFlipOrder,
} from '../../utils';
import { TestPopOverConstants, TestPopoverTriggerEnum } from './model';

@Component({
	tag: 'test-popover',
	styleUrl: 'popover.scss',
	shadow: false,
})
export class AwPopover {
	private _constants = TestPopOverConstants;
	private _popoverElement: any;
	private _sourceElement: any;

	@Element() host: HTMLElement;

	/**This property determines when to show popover. Can be either on hover or pressed */
	@Prop() trigger?: string = TestPopoverTriggerEnum.PRESSED;

	/**This property determines element on which popover is shown */
	@Prop() target: string;

	/**This property determines header name inside popover */
	@Prop() header?: string = null;

	/**This property determines whether or not the popover is dismissable with a click inside popover */
	@Prop() hideWithInsideClick?: boolean = false;

	/**This property determines if popover styling should be of a data-point popover. Is for numbers/text only */
	@Prop() isDataPoint?: boolean = false;

	/**
	 * This property specifies the target element and can be used to pass components dynamically when we can't use slot
	 *
	 * @default undefined
	 */
	@Prop() targetElement?: any;

	/**
	 * This property specifies the source element and can be used to pass components dynamically when we can't use slot
	 *
	 * @default undefined
	 */
	@Prop() sourceElement?: any;

	/**
	 * This property sets if popover has a closing icon
	 * @type {boolean}
	 * @default true
	 */
	@Prop() hasCloseIcon?: boolean = true;

	/**
	 * When true, opens the popover overlay
	 * @type {boolean}
	 * @default false
	 */
	@Prop({ mutable: true })
	isOpen: boolean = false;

	/**
	 * This property can be used to override the padding of a popover.
	 * To be used in special cases only.
	 * @type {number}
	 * @default undefined
	 */
	@Prop() padding?: number;

	/**
	 * This event is emitted when the popover is opened
	 */
	@Event() popoverOpened: EventEmitter;
	/**
	 * This event is emitted when the popover is closed
	 */
	@Event() popoverClosed: EventEmitter;

	/**
	 * This method opens the popover
	 * @returns {Promise<void>}
	 */
	@Method()
	async open(): Promise<void> {
		this.isOpen = true;
	}

	/**
	 * This method closes the popover
	 * @returns {Promise<void>}
	 */
	@Method()
	async close(): Promise<void> {
		this.isOpen = false;
	}

	/**
	 * This method is used to render the popover with sufficient spacing within the given viewport
	 * @returns {Promise<boolean>}
	 */
	@Method()
	async updatePosition(): Promise<boolean> {
		if (this._overlay) {
			this._overlay.updatePosition();
			return Promise.resolve(true);
		}
		return Promise.resolve(false);
	}

	/**
	 * Creates overlay container in body and append popover element
	 *
	 * @param el Element reference
	 */
	private _overlay: AwOverlayPopoverController;

	@Watch('isOpen')
	isOpenHandler(newProp) {
		newProp ? this.openOverlay() : this.closeOverlay();
	}

	public componentDidUnload(): void {
		this.closeOverlay();
	}

	public closeOverlay(): void {
		this.isOpen = false;
		if (this._overlay) {
			this._overlay.close();
			this._overlay = null;
		}
		this.popoverClosed.emit();
	}

	private openOverlay(): void {
		if (this.isOpen && this._overlay) {
			this._overlay.open();
			this.popoverOpened.emit();
		}
	}

	private updateState(value: boolean): void {
		if (value) {
			this.isOpen = true;
			if (this._overlay) {
				this._overlay.openOverlayWithPosition();
			}
		} else {
			this.isOpen = false;
		}
	}

	private sourceElementHandler(el: HTMLElement): HTMLElement {
		if (this.sourceElement) {
			const contentEl = Array.from(el.getElementsByTagName('div')).find(
				el => el.getAttribute('slot') === 'content'
			);
			if (contentEl) {
				contentEl.appendChild(this.sourceElement);
			}
		}
		return el;
	}

	private targetElementHandler(): AwOverlayControllerTargetElementOptionsInterface {
		let targetElementOptions = null;
		if (this.targetElement) {
			targetElementOptions = {
				targetForEventListeners: this.targetElement,
			};
		}
		return targetElementOptions;
	}

	/**
	 * Add popover tip class based on it's position
	 */
	private renderTipOnPopover(value: AwDynamicPosition): void {
		const { CONTAINER } = this._constants.STRING;
		if (get(value, 'position', AwDynamicPositionEnum.BOTTOM_CENTER)) {
			const splitArr = lowerCase(value.position).split(' ');
			if (get(value, 'source', [])) {
				const oldClass = filter(value.source.classList, className =>
					startsWith(className, CONTAINER)
				);
				map(oldClass, className =>
					value.source.classList.remove(className)
				);
				value.source.classList.add(
					`${this.updatePopoverContainerCssClass()}--${`${splitArr[0].toLowerCase()}-${splitArr[1].toLowerCase()}`}`
				);
			}
		}
	}

	/**
	 * Updates popover element's classes based on dataPoint
	 */

	private updatePopoverContainerCssClass(): string {
		const { CONTAINER, DATA_POINT_CLASS } = this._constants.STRING;
		const dataPoint = this.isDataPoint ? DATA_POINT_CLASS : '';
		return `${CONTAINER}${dataPoint}`;
	}

	/**
	 * Determine if click is inside or outside popover
	 */

	private isOutsidePopoverWindow(event: Event): boolean {
		const { CONTAINER } = this._constants.STRING;
		if (this._overlay && !this.hideWithInsideClick) {
			return this._overlay.isOutsidePopoverController(event, CONTAINER);
		} else {
			return true;
		}
	}

	/**
	 * Returns string for css
	 */

	private getContainerCss(): string {
		const { CONTAINER, DATA_POINT } = this._constants.STRING;
		const dataPoint = this.isDataPoint ? DATA_POINT : '';
		return `${CONTAINER} ${dataPoint}`;
	}

	private renderPopoverHeader(): JSX.Element {
		const {
			HEADER_CONTAINER,
			HEADER,
			CLOSE_BUTTON,
		} = this._constants.STRING;
		let closeIcon;
		if (
			this.trigger === TestPopoverTriggerEnum.PRESSED &&
			this.hasCloseIcon
		) {
			closeIcon = (
				<div class={CLOSE_BUTTON}>
					<aw-icon
						type="delete-small"
						onClick={this.close.bind(this)}
						state="primary"
					/>
				</div>
			);
		}
		if (this.header) {
			return (
				<div class={HEADER_CONTAINER}>
					<div class={HEADER}>{this.header}</div>
					{closeIcon}
				</div>
			);
		}
	}

	private getContentCss(): string {
		const { AW_CONTENT, DATA_POINT_CONTENT } = this._constants.STRING;
		return `${!this.isDataPoint ? AW_CONTENT : DATA_POINT_CONTENT}`;
	}

	private renderPopoverContent(): JSX.Element {
		const { CONTENT } = this._constants.STRING;
		return (
			<div class={this.getContentCss()}>
				{!this.isDataPoint && this.renderPopoverHeader()}
				<slot name={CONTENT} />
			</div>
		);
	}

	private renderPopoverContainer(): JSX.Element {
		return (
			<section
				class={this.getContainerCss()}
				ref={el => (this._sourceElement = el)}
			>
				{this.renderPopoverContent()}
			</section>
		);
	}
	componentDidRender() {
		if (!this._overlay && this._popoverElement) {
			let paddingVal;
			if (this.padding) {
				paddingVal = this.padding;
			} else {
				paddingVal = this.isDataPoint ? 8 : 12;
			}
			this.sourceElementHandler(this._popoverElement);
			const customTargetElementOptions = this.targetElementHandler();
			this._overlay = new AwOverlayPopoverController(
				this.host,
				this._popoverElement,
				this._popoverElement.firstElementChild as HTMLElement,
				this._sourceElement as HTMLElement,
				this.updateState.bind(this),
				{
					trigger: this.trigger as AwOverlayTriggerEnum,
					overlaysToClose: [
						AwPositionConstants.STRING.POPOVER_CONTAINER,
					],
					targetElementOptions: customTargetElementOptions,
					modifiers: {
						isOnCursorPosition: false,
						flipOrder: DefaultFlipOrder,
						defaultPlacement: AwDynamicPositionEnum.BOTTOM_CENTER,
						padding: paddingVal,
					},
				},
				this.isOutsidePopoverWindow.bind(this),
				this.renderTipOnPopover.bind(this)
			);

			this.openOverlay();
		}
	}

	render(): JSX.Element {
		const { TARGET } = this._constants.STRING;
		return (
			<section ref={el => (this._popoverElement = el)}>
				<slot name={TARGET} />
				{this.renderPopoverContainer()}
			</section>
		);
	}
}
