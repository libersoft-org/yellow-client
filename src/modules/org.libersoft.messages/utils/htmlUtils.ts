/**
 * Wraps consecutive elements named `X` with a new element `Y` if there are more than 2 consecutive occurrences.
 *
 * @param {DocumentFragment} fragment - The DocumentFragment to process.
 * @param {string} xName - The tag name of elements to check (case-insensitive).
 * @param {string} yName - The tag name of the wrapper element.
 * @param {number} minConsecutive - The minimum number of consecutive elements to wrap (default: 2).
 */
export function wrapConsecutiveElements(fragment: DocumentFragment, xName: string, yName: string, minConsecutive = 2): void {
	xName = xName.toLowerCase(); // Normalize case

	function processParent(parent: ParentNode): void {
		const children: ChildNode[] = Array.from(parent.childNodes); // Get all child nodes
		let consecutiveXs: Element[] = [];

		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName.toLowerCase() === xName) {
				consecutiveXs.push(child as Element);
			} else {
				if (consecutiveXs.length >= minConsecutive) {
					wrapWithY(consecutiveXs);
				}
				consecutiveXs = []; // Reset the sequence if non-X is found
			}
		}

		// Handle any trailing sequence of X elements
		if (consecutiveXs.length >= minConsecutive) {
			wrapWithY(consecutiveXs);
		}

		// Recurse into child elements
		children.forEach(child => {
			if (child.nodeType === Node.ELEMENT_NODE) {
				processParent(child as Element);
			}
		});
	}

	function wrapWithY(elements: Element[]): void {
		const wrapper = document.createElement(yName);
		elements[0].parentNode!.insertBefore(wrapper, elements[0]);
		elements.forEach(el => wrapper.appendChild(el));
	}

	processParent(fragment);
}
