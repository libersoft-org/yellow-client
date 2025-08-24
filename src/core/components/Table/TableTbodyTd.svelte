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

				// Apply the constrained width
				const elementEl = element as HTMLElement;
				elementEl.style.maxWidth = `${finalWidth}px`;
				// Add class to show the element
				elementEl.classList.add('width-calculated');
			});
		}
	};

	// Function to update text-truncate-without-suffix elements width
	const updateTruncateWithoutSuffixWidths = () => {
		const truncateElements = tdElement?.querySelectorAll('.text-truncate-without-suffix');
		if (truncateElements) {
			truncateElements.forEach(element => {
				// Find the next sibling that contains the suffix (symbol)
				const nextSibling = element.nextSibling;
				let suffixWidth = 0;

				if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
					// If next sibling is text (like " (SYMBOL)"), we need to measure it
					const tempSpan = document.createElement('span');
					tempSpan.style.visibility = 'hidden';
					tempSpan.style.position = 'absolute';
					tempSpan.style.whiteSpace = 'nowrap';
					tempSpan.textContent = nextSibling.textContent;
					document.body.appendChild(tempSpan);
					suffixWidth = tempSpan.offsetWidth;
					document.body.removeChild(tempSpan);
				} else if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
					// If next sibling is an element, measure its width
					const siblingEl = nextSibling as HTMLElement;
					suffixWidth = siblingEl.offsetWidth;
				}

				// Get computed styles to calculate actual content width
				const computedStyle = window.getComputedStyle(tdElement);
				const paddingLeft = parseFloat(computedStyle.paddingLeft);
				const paddingRight = parseFloat(computedStyle.borderRightWidth);
				const borderLeft = parseFloat(computedStyle.borderLeftWidth);
				const borderRight = parseFloat(computedStyle.borderRightWidth);

				// Calculate content width by subtracting padding, borders, and suffix width
				const contentWidth = tdElement.offsetWidth - paddingLeft - paddingRight - borderLeft - borderRight - suffixWidth;

				// Reduce width by 10px to give breathing room
				const finalWidth = contentWidth - 10;

				// Apply the constrained width
				const elementEl = element as HTMLElement;
				elementEl.style.maxWidth = `${finalWidth}px`;
				// Add class to show the element
				elementEl.classList.add('width-calculated');
			});
		}
	};

	// Function to update text-truncate-with-prefix elements width
	const updateTruncateWithPrefixWidths = () => {
		console.log('updateTruncateWithPrefixWidths called, current TD width:', tdElement?.offsetWidth);

		// Debug: Check computed styles of the TD
		if (tdElement) {
			const computedStyle = window.getComputedStyle(tdElement);
			console.log('TD computed styles:', {
				width: computedStyle.width,
				maxWidth: computedStyle.maxWidth,
				minWidth: computedStyle.minWidth,
				flex: computedStyle.flex,
				flexBasis: computedStyle.flexBasis,
				flexGrow: computedStyle.flexGrow,
				flexShrink: computedStyle.flexShrink,
			});
		}

		const truncateElements = tdElement?.querySelectorAll('.text-truncate-with-prefix');
		console.log('Found prefix elements:', truncateElements?.length);
		if (truncateElements) {
			truncateElements.forEach(element => {
				// Find the icon element by looking for the network-icon class in the same container
				const container = element.closest('.network');
				let prefixWidth = 0;

				if (container) {
					const iconElement = container.querySelector('.network-icon');
					if (iconElement) {
						prefixWidth = (iconElement as HTMLElement).offsetWidth;
						console.log('Found icon, width:', prefixWidth);
					} else {
						console.log('No icon element found');
					}
				} else {
					console.log('No network container found');
				}

				// Get computed styles to calculate actual content width
				const computedStyle = window.getComputedStyle(tdElement);
				const paddingLeft = parseFloat(computedStyle.paddingLeft);
				const paddingRight = parseFloat(computedStyle.borderRightWidth);
				const borderLeft = parseFloat(computedStyle.borderLeftWidth);
				const borderRight = parseFloat(computedStyle.borderRightWidth);

				// Calculate content width by subtracting padding, borders, and prefix width
				let contentWidth = tdElement.offsetWidth - paddingLeft - paddingRight - borderLeft - borderRight - prefixWidth;

				// Proactive width reduction: if TD is taking up too much screen width, reduce it
				const screenWidth = window.innerWidth;
				const tdPercentage = (tdElement.offsetWidth / screenWidth) * 100;

				console.log('Screen width analysis:', {
					screenWidth,
					tdWidth: tdElement.offsetWidth,
					tdPercentage: tdPercentage.toFixed(1) + '%',
				});

				// If TD is taking more than 50% of screen width, reduce it proportionally
				if (tdPercentage > 50) {
					const targetPercentage = 50; // Target 50% of screen width
					const targetWidth = (screenWidth * targetPercentage) / 100;
					const reductionFactor = targetWidth / tdElement.offsetWidth;
					contentWidth = contentWidth * reductionFactor;

					console.log('Width reduction applied:', {
						originalContentWidth: tdElement.offsetWidth - paddingLeft - paddingRight - borderLeft - borderRight - prefixWidth,
						reductionFactor: reductionFactor.toFixed(2),
						newContentWidth: contentWidth.toFixed(0),
					});
				}

				// Reduce width by 10px to give breathing room
				const finalWidth = contentWidth - 10;

				console.log('Prefix width calculation:', {
					tdWidth: tdElement.offsetWidth,
					paddingLeft,
					paddingRight,
					borderLeft,
					borderRight,
					prefixWidth,
					contentWidth: contentWidth.toFixed(0),
					finalWidth: finalWidth.toFixed(0),
				});

				// Apply the constrained width to the .name child element
				const nameElement = element.querySelector('.name') as HTMLElement;
				if (nameElement) {
					nameElement.style.maxWidth = `${finalWidth}px`;
					nameElement.style.overflow = 'hidden';
					nameElement.style.textOverflow = 'ellipsis';
					nameElement.style.whiteSpace = 'nowrap';
					// Add class to show the element
					nameElement.classList.add('width-calculated');
				} else {
					// Fallback: apply to parent element if no .name child found
					const elementEl = element as HTMLElement;
					elementEl.style.maxWidth = `${finalWidth}px`;
					elementEl.classList.add('width-calculated');
				}
			});
		}
	};

	onMount(() => {
		// Use tick to ensure DOM is fully rendered before calculating widths
		tick().then(() => {
			// Initial update
			updateTruncateWidths();
			updateTruncateWithoutSuffixWidths();
			updateTruncateWithPrefixWidths();
		});

		// Update on window resize
		const resizeObserver = new ResizeObserver(entries => {
			try {
				// Check if we're still mounted and element exists
				if (!tdElement || !tdElement.isConnected) {
					return;
				}

				console.log('ResizeObserver triggered for:', tdElement.textContent?.substring(0, 20));

				// Use requestAnimationFrame to prevent ResizeObserver loop errors
				requestAnimationFrame(() => {
					if (tdElement && tdElement.isConnected) {
						updateTruncateWidths();
						updateTruncateWithoutSuffixWidths();
						updateTruncateWithPrefixWidths();
					}
				});
			} catch (error) {
				// Silently handle any ResizeObserver errors
				console.debug('ResizeObserver error handled:', error);
			}
		});

		// Watch for DOM changes (new .text-truncate elements added)
		const mutationObserver = new MutationObserver(mutations => {
			try {
				// Check if we're still mounted and element exists
				if (!tdElement || !tdElement.isConnected) {
					return;
				}

				let shouldUpdate = false;
				mutations.forEach(mutation => {
					if (mutation.type === 'childList') {
						mutation.addedNodes.forEach(node => {
							if (node.nodeType === Node.ELEMENT_NODE) {
								const element = node as Element;
								if (element.classList?.contains('text-truncate') || element.querySelector?.('.text-truncate') || element.classList?.contains('text-truncate-without-suffix') || element.querySelector?.('.text-truncate-without-suffix') || element.classList?.contains('text-truncate-with-prefix') || element.querySelector?.('.text-truncate-with-prefix')) {
									shouldUpdate = true;
								}
							}
						});
					}
				});

				if (shouldUpdate) {
					// Use requestAnimationFrame instead of setTimeout to prevent timing issues
					requestAnimationFrame(() => {
						if (tdElement && tdElement.isConnected) {
							updateTruncateWidths();
							updateTruncateWithoutSuffixWidths();
							updateTruncateWithPrefixWidths();
						}
					});
				}
			} catch (error) {
				// Silently handle any mutation observer errors
				console.debug('MutationObserver error handled:', error);
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
		max-width: 100%;
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

	/* Text truncation without suffix wrapper class */
	:global(.text-truncate-without-suffix) {
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
	:global(.text-truncate-without-suffix.width-calculated) {
		opacity: 1;
	}

	/* Text truncation with prefix wrapper class (for elements that come before text) */
	:global(.text-truncate-with-prefix) {
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
	:global(.text-truncate-with-prefix.width-calculated) {
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
