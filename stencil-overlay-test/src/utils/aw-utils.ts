
export function addEventListenerOnElement(
	element: HTMLElement | SVGElement,
	eventName: string,
	callback: EventListenerOrEventListenerObject
): void {
	if (element && eventName && callback) {
		element.addEventListener(eventName, callback);
	}
}

export function removeEventListenerOnElement(
	element: HTMLElement | SVGElement,
	eventName: string,
	callback: EventListenerOrEventListenerObject
): void {
	if (element && eventName && callback) {
		element.removeEventListener(eventName, callback);
	}
}

export function createElementWithClass(
	className: string,
	elementTag: string = 'div'
): HTMLElement | SVGElement {
	const element = document.createElement(elementTag);
	element.className = className;
	return element;
}

export function elementExists(elementClassName: string): boolean {
	return document.getElementsByClassName(elementClassName).length!=0;
}

export function getElement(elementClassName: string): HTMLElement | SVGElement {
	return document.getElementsByClassName(elementClassName)[0] as
		| HTMLElement
		| SVGElement;
}

export function removeFromContainer(element: HTMLElement | SVGElement): void {
	if (element !== document.body) {
		const parent: HTMLElement | SVGElement = element.parentElement;
		if (parent) {
			parent.removeChild(element);
			if (parent.childElementCount === 0) {
				removeFromContainer(parent);
			}
		}
	}
}

/**
 * Function to safely get shadowRoot node for a given host element.
 * @param {HTMLElement} root The host element for which shadowRoot is retrieved
 * @returns {ShadowRoot | HTMLElement}
 */
export function getShadowRootElement(
	root: HTMLElement
): ShadowRoot | HTMLElement {
	if (root) {
		// With polyfills for CustomElements and ShadowDOM, we can safely perform Element.shadowRoot. Stencil's compiler internally uses this polyfills to return the host element for Element.shadowRoot.
		return root.shadowRoot;
	}
}

/**
 * Function to safely get slotted elements for a given element
 * @param {ShadowRoot | HTMLElement} root The root element for which slotted elements are retrieved
 * @returns {Array<HTMLElement | Node>}
 */
export function getSlottedElements(
	root: ShadowRoot | HTMLElement
): Array<HTMLElement | Node> {
	if (root) {
		const slotElement = root.querySelector('slot') as HTMLSlotElement;
		if (slotElement) {
			return slotElement.assignedNodes() as Array<Node>;
		} else {
			// Support for IE11 - which does not support CustomElements, Shadow DOM.
			return root.children[0].children as any;
		}
	}
}

/**
 * Function to get Web Component for a given Element
 * @param {HTMLElement} node
 * @returns {HTMLElement}
 */
export function getAwElement(node: HTMLElement): HTMLElement {
	if (node) {
		if (node.tagName.startsWith('AW')) {
			return node;
		} else if (node.tagName.startsWith('AUX')) {
			return node.children[0] as HTMLElement;
		}
	}
}

/**
 * Function that returns event path
 * Since some older browser including IE11 does not support 'event.path' this function is a safe way to perform checks on event.path.
 * @param event Event
 */
export function getElementPath(event: any): Array<HTMLElement> {
	// Event.path is not supported in IE11.
	if (event) {
		if (event.path != null) {
			// If browser supports event.path
			return event.path;
		} else {
			// If browser does not support event.path
			let path = [];
			let node = event.target;
			while (node && node != document.body) {
				path.push(node);
				node = node.parentElement;
			}
			// return the path of the event
			return path;
		}
	}
}

/**
 * Function to check if the given element is present in the event path.
 * Since some older browser including IE11 does not support 'event.path' this function is a safe way to perform checks on event.path.
 * @param event Event
 * @param el Element to search for in the given event
 */
export function isElementInEventPath(event: any, el: any): boolean {
	// Event.path is not supported in IE11.
	if (event) {
		if (event.path != null) {
			// If browser supports event.path
			return event.path.find(element => element === el);
		} else {
			// If browser does not support event.path
			let flag = false;
			let targetElement = event.target; // clicked element
			do {
				if (targetElement == el) {
					// This is a click inside. Do nothing, just break.
					flag = true;
					break;
				}
				// Go up the DOM
				targetElement = targetElement.parentNode;
			} while (targetElement);
			return flag;
		}
	}
}

