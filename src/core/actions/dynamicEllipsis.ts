import type { Action } from 'svelte/action';

interface DynamicEllipsisOptions {
	/** Minimum height to ensure, in pixels */
	minHeight?: number;
	/** Debounce delay for resize events, in milliseconds */
	debounceMs?: number;
}

/**
 * Action that dynamically measures content height and applies it to the ::before pseudo-element
 * of ellipsis table cells, replacing hardcoded heights with flexible sizing
 */
export const dynamicEllipsis: Action<HTMLElement, DynamicEllipsisOptions> = (element, options = {}) => {
	const { minHeight = 0, debounceMs = 25 } = options;

	let resizeObserver: ResizeObserver | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function measureAndUpdateHeight() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			// Find the first child element that contains the actual content
			const contentElement = element.querySelector(':scope > *:first-child') as HTMLElement;

			if (contentElement) {
				// Temporarily remove absolute positioning to measure natural height
				const originalPosition = contentElement.style.position;
				const originalTransform = contentElement.style.transform;
				const originalTop = contentElement.style.top;
				const originalLeft = contentElement.style.left;
				const originalRight = contentElement.style.right;

				// Reset positioning to measure natural height
				contentElement.style.position = 'static';
				contentElement.style.transform = 'none';
				contentElement.style.top = 'auto';
				contentElement.style.left = 'auto';
				contentElement.style.right = 'auto';

				// Measure the natural height of the content
				const contentHeight = contentElement.offsetHeight;
				const measuredHeight = Math.max(contentHeight, minHeight);

				// Restore original positioning
				contentElement.style.position = originalPosition;
				contentElement.style.transform = originalTransform;
				contentElement.style.top = originalTop;
				contentElement.style.left = originalLeft;
				contentElement.style.right = originalRight;

				// Apply the measured height to the ::before pseudo-element via CSS custom property
				element.style.setProperty('--dynamic-min-height', `${measuredHeight}px`);
			}
		}, debounceMs);
	}

	// Initial measurement
	measureAndUpdateHeight();

	// Set up ResizeObserver to watch for content changes
	if (typeof ResizeObserver !== 'undefined') {
		resizeObserver = new ResizeObserver(() => {
			measureAndUpdateHeight();
		});

		// Observe the element and its children
		resizeObserver.observe(element);
		const contentElement = element.querySelector(':scope > *:first-child');
		if (contentElement) {
			resizeObserver.observe(contentElement);
		}
	}

	return {
		update(newOptions) {
			// Update options if needed
			Object.assign(options, newOptions);
			measureAndUpdateHeight();
		},

		destroy() {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
		},
	};
};
