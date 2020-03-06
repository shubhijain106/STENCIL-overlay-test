

import { AwPositionConstants } from './position.constants';
const {
	BACKDROP_CONTAINER,
	DIV,
	BACKDROP_SHOW,
	BACKDROP_CENTER,
} = AwPositionConstants.STRING;

export class AwOverlayCenter {
	private constructBackdropContainer(): HTMLElement {
		let overlayPaneCenter: HTMLElement;
		let backdropContainer = document.createElement(DIV);
		backdropContainer.className = BACKDROP_CONTAINER;
		overlayPaneCenter = this.appendBackdropCenterElement(
			this.appendBackDropElement(backdropContainer)
		);
		document.body.appendChild(backdropContainer);
		return overlayPaneCenter;
	}

	public appendToBody(element: Element): void {
		let backdropContainer = this.getBackdropContainer();
		let backdropPaneCenter: HTMLElement;
		if (this.backdropContainerExists()) {
			backdropPaneCenter = this.appendBackdropCenterElement(
				this.appendBackDropElement(backdropContainer)
			);
			backdropPaneCenter.appendChild(element);
		} else {
			backdropPaneCenter = this.constructBackdropContainer();
			backdropPaneCenter.appendChild(element);
		}
  }

  public getBackdropContainer(): HTMLElement {
		return document.getElementsByClassName(
			BACKDROP_CONTAINER
		)[0] as HTMLElement;
  }
  public backdropContainerExists(): boolean {
		return (document.getElementsByClassName(BACKDROP_CONTAINER)).length!= 0;
	}

	public open(element: HTMLElement): void {
		this.appendToBody(element);
	}

	public close(element: HTMLElement): void {
		if (element && element.parentElement) {
			while (element.className != BACKDROP_SHOW) {
				let parentElement = element.parentElement;
				parentElement.removeChild(element);
				element = parentElement;
			}
			let parentElement = element.parentElement;
			parentElement.removeChild(element);
			if (
				parentElement.className === BACKDROP_CONTAINER &&
				parentElement.children.length == 0
			) {
				document.body.removeChild(parentElement);
				parentElement = null;
			}
			element = null;
		}
	}
	public appendBackDropElement(backdropContainer: HTMLElement): HTMLElement {
		let overlay_background = document.createElement(DIV);
		overlay_background.className = BACKDROP_SHOW;
		backdropContainer.appendChild(overlay_background);
		return overlay_background;
	}

	public appendBackdropCenterElement(
		overlay_background: HTMLElement
	): HTMLElement {
		let overlayPaneCenter = document.createElement(DIV);
		overlayPaneCenter.className = BACKDROP_CENTER;
		overlay_background.appendChild(overlayPaneCenter);
		return overlayPaneCenter;
	}
	public backDropElementExists(): boolean {
		return document.getElementsByClassName(BACKDROP_SHOW).length!=0;
	}
}

