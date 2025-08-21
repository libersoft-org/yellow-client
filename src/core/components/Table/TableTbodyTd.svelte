<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, tick } from 'svelte';
	interface Props {
		children?: Snippet;
		title?: string;
		'data-testid'?: string;
		padding?: string;
		colspan?: number;
		style?: string;
		align?: 'left' | 'center' | 'right';
		expand?: boolean;
		bold?: boolean;
	}
	let { children, title, 'data-testid': dataTestId, padding = '10px', colspan, style, align = 'left', expand = false, bold = false }: Props = $props();

	let tdElement: HTMLTableCellElement;

	// Function to update text-truncate elements width
	const updateTruncateWidths = () => {
		const truncateElements = tdElement?.querySelectorAll('.text-truncate');
		if (truncateElements) {
			truncateElements.forEach(element => {
				// Get computed styles to calculate actual content width
				const computedStyle = window.getComputedStyle(tdElement);
				const paddingLeft = parseFloat(computedStyle.paddingLeft);
				const paddingRight = parseFloat(computedStyle.borderRightWidth);
				const borderLeft = parseFloat(computedStyle.borderLeftWidth);
				const borderRight = parseFloat(computedStyle.borderRightWidth);

				// Calculate content width by subtracting padding and borders
				const contentWidth = tdElement.offsetWidth - paddingLeft - paddingRight - borderLeft - borderRight;

				// Reduce width by 10px to give breathing room
				const finalWidth = contentWidth - 10;

				// Set minimum width to half of the current width to ensure readability
				const minWidth = Math.max(150, finalWidth * 0.5);
				const constrainedWidth = Math.max(finalWidth, minWidth);

				// Apply the constrained width
				const elementEl = element as HTMLElement;
				elementEl.style.maxWidth = `${constrainedWidth}px`;
				elementEl.style.minWidth = `${minWidth}px`;
				// Add class to show the element
				elementEl.classList.add('width-calculated');
			});
		}
	};

	onMount(() => {
		// Use tick to ensure DOM is fully rendered before calculating widths
		tick().then(() => {
			// Initial update
			updateTruncateWidths();
		});

		// Update on window resize
		const resizeObserver = new ResizeObserver(() => {
			updateTruncateWidths();
		});

		// Watch for DOM changes (new .text-truncate elements added)
		const mutationObserver = new MutationObserver(mutations => {
			let shouldUpdate = false;
			mutations.forEach(mutation => {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach(node => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const element = node as Element;
							if (element.classList?.contains('text-truncate') || element.querySelector?.('.text-truncate')) {
								shouldUpdate = true;
							}
						}
					});
				}
			});

			if (shouldUpdate) {
				// Small delay to ensure DOM is fully updated
				setTimeout(updateTruncateWidths, 0);
			}
		});

		if (tdElement) {
			resizeObserver.observe(tdElement);
			mutationObserver.observe(tdElement, {
				childList: true,
				subtree: true,
			});
		}

		// Cleanup
		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	});
</script>

<style>
	td {
		border: 0;
		white-space: nowrap;
	}

	td.bold {
		font-weight: bold;
	}

	td.expand {
		width: 100%;
		/* Prevent horizontal overflow during initial render */
		overflow: hidden;
	}

	/* Text truncation wrapper class */
	:global(.text-truncate) {
		display: block;
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
		box-sizing: border-box;
		vertical-align: middle;
		/* Prevent initial scrollbar flicker */
		max-width: 0;
		opacity: 0;
		transition: opacity 0.1s ease-in-out;
	}

	/* Show the element after width is calculated */
	:global(.text-truncate.width-calculated) {
		opacity: 1;
	}

	td :global(*) {
		display: inline-block;
	}

	td > :global(*:not(.text-truncate)) {
		display: flex;
		align-items: center;
	}

	td[style*='text-align: left'] > :global(*) {
		justify-content: flex-start;
	}

	td[style*='text-align: center'] > :global(*) {
		justify-content: center;
	}

	td[style*='text-align: right'] > :global(*) {
		justify-content: flex-end;
	}
</style>

<td bind:this={tdElement} data-title={title} data-testid={dataTestId} style:padding class:expand class:bold {colspan} {style} style:text-align={align}>
	{@render children?.()}
</td>
