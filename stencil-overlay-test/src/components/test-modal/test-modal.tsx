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
import get from 'lodash/get';
import { AwOverlayCenter } from '../../utils';
import {
	TestModalConstants,
	TestModalType
} from './model';

const { HEADER,KEYDOWN,CONTENT_HIDE,FOOTER_WITH_LINK,AW_MODAL, CONTENT, CONTENT_SHOW,CONTAINER_ACTION,
  CONTAINER_INFORMATION,
  ACTION,
  CONTAINER_LARGE,WRAPPER,BUTTONS,
  PRIMARY_BUTTON_PADDING,
  FOOTER,CONTENT_LARGE, CONTENT_GREY } = TestModalConstants.STRING;

@Component({
  tag: 'test-modal',
  styleUrl: 'test-modal.scss',
	shadow: false,
})
export class Modal {
  private _escapeKeyHandler: () => void;
  private _modalRef: HTMLDivElement;
	private _modalElement: HTMLElement;
	private _overlayCenter: AwOverlayCenter;
	@Element() host: HTMLElement;
	/**
	 * A property that sets the header of this modal.
	 *
	 * @default 'Warning'
	 * @type {string}
	 */
	@Prop() header?: string = 'Warning';
	/**
	 * A property that sets the type of this modal.
	 *
	 * @default 'information'
	 * @type {ModalType}
	 */
	@Prop() type?: TestModalType = 'information';
	/**
	 * A property that determines if the size of this modal should be large or not.
	 *
	 * @default 'false'
	 * @type {boolean}
	 */
	@Prop() isLarge?: boolean = false;

	/**
	 * A property that determines if the background-color of this modal content should be grey or white.
	 *
	 * @default 'false'
	 * @type {boolean}
	 */
	@Prop() hasGreyContentArea?: boolean = false;

	/**
	 * When true, It would override existing header with the custom header
	 * @type {boolean}
	 * @default false
	 */
	@Prop() hasCustomHeader?: boolean = false;

	/**
	 * When true, It would override existing footer with the custom footer
	 * @type {boolean}
	 * @default false
	 */
	@Prop() hasCustomFooter?: boolean = false;

	/**
	 * This event emits when modal is opened.
	 */
	@Event() modalOpened: EventEmitter;

	/**
	 * This event emits when modal is closed.
	 */
	@Event() modalClosed: EventEmitter;

	/**
	 * When true, opens the modal
	 * @type {boolean}
	 * @default false
	 */
	@Prop({ mutable: true })
	isOpen: boolean = false;

	/**
	 * This method allows for the opening of modal
	 */
	@Method()
	public async open(): Promise<void> {
		this.isOpen = true;
	}
	/**
	 * This method allows for the closing of modal
	 */
	@Method()
	public async close(): Promise<void> {
		this.isOpen = false;
	}

	@Watch('isOpen')
	isOpenHandler(newProp) {
		newProp ? this.openModal() : this.closeModal();
	}

	componentWillLoad() {
		this._overlayCenter = new AwOverlayCenter();
		// this.renderType();
		this.host.classList.add(CONTENT_HIDE);
	}

	public componentDidUnload(): void {
		this.closeModal();
	}

	componentDidLoad() {
		this.openModal();
	}

	componentDidRender() {
		this.handleFooterLinkClass();
  }

  private handleFooterLinkClass(): void {
		if (this._modalRef && this._modalRef.childElementCount > 1) {
			this._modalRef.classList.add(FOOTER_WITH_LINK);
		}
	}

	componentDidUpdate() {
		this.openModal();
  }
  private escapeKeyHandler(event: KeyboardEvent): void {
		if (event.keyCode == 27) {
			this.closeModal();
		}
	}

	public closeModal(): void {
		this.isOpen = false;
		if (this._overlayCenter) {
			this._overlayCenter.close(this._modalElement);
		}
		if (this._modalElement) {
			this.host.appendChild<HTMLElement>(this._modalElement);
			this._modalElement = null;
   	document.removeEventListener(KEYDOWN, this._escapeKeyHandler);
			this.modalClosed.emit();
		}
  }

  public addEventListeners(): void {
		this._escapeKeyHandler = this.escapeKeyHandler.bind(this);
		document.addEventListener(KEYDOWN, this._escapeKeyHandler);
	}

	private openModal(): void {
		if (this.isOpen && this._modalElement) {
			let overlay_modalElement = this._modalElement;
			overlay_modalElement.classList.add(AW_MODAL);
			this._overlayCenter.open(overlay_modalElement);
			this.addEventListeners();
			this.modalOpened.emit();
		}
	}
	private handleModalRef(el: HTMLElement) {
		if (el) {
			this._modalElement = el;
			const contentEl = get(
				el.getElementsByClassName(CONTENT),
				'0.firstElementChild'
			);
			if (contentEl) {
				contentEl.classList.add(CONTENT_SHOW);
			}
		}
	}
	private get containerClasses(): string {

		return `${
			this.type === ACTION ? CONTAINER_ACTION : CONTAINER_INFORMATION
		} ${this.isLarge ? CONTAINER_LARGE : ''}`;
  }

	private get contentClasses(): string {
		return `${CONTENT} ${this.isLarge ? CONTENT_LARGE : ''} ${
			this.hasGreyContentArea ? CONTENT_GREY : ''
		}`;
  }


	private renderHeader(): JSX.Element {
		if (this.hasCustomHeader) {
			return <slot name="custom-header" />;
		}
		return <div class={HEADER}>{this.header}</div>
  }


	private renderFooter(): JSX.Element {
		if (this.hasCustomFooter) {
			return <slot name="custom-footer" />;
		}
		return (
			<div class={FOOTER} ref={el => (this._modalRef = el)}>
				<div class={BUTTONS}>
					<div class={PRIMARY_BUTTON_PADDING}>
						<slot name="primary-button" />
					</div>
					<slot name="secondary-button" />
				</div>
				<slot name="tertiary-link" />
			</div>
		);
	}

	private renderModalContainer(): JSX.Element {
		return (
			<div class={WRAPPER}>
				<div class={this.containerClasses}>
					{this.renderHeader()}
					<div class={this.contentClasses}>
						<slot name="content" />
					</div>
				</div>
				{this.renderFooter()}
			</div>
		);
	}

	public render(): JSX.Element {
		if (this.isOpen) {
			return (
				<div ref={el => this.handleModalRef(el)}>
					{this.renderModalContainer()}
				</div>
			);
		}
	}
}
