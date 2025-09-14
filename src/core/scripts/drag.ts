import { writable } from 'svelte/store';

// Global store to track drag state across all tables
export const isDragging = writable(false);

export interface DragConfig {
	/** Function to get all registered drag handles */
	getDragHandles: () => HTMLElement[];
	/** Number of columns in the table for colspan */
	columnCount: number;
	/** Callback when reordering is needed */
	onReorder: (sourceIndex: number, targetIndex: number) => void;
	/** Optional: Custom drop indicator HTML */
	dropIndicatorHTML?: string;
	/** Optional: Custom styling for the dragged clone */
	cloneStyles?: Partial<CSSStyleDeclaration>;
}

export interface DragState {
	dragSourceIndex: number | null;
	dragOverIndex: number | null;
	isDragging: boolean;
	dragElement: HTMLElement | null;
	dragClone: HTMLElement | null;
	isAtEnd: boolean;
	originalRowHeight: number; // Store the original row height
	originalRowWidth: number; // Store the original row width
}

export class TableDragManager {
	private state: DragState = {
		dragSourceIndex: null,
		dragOverIndex: null,
		isDragging: false,
		dragElement: null,
		dragClone: null,
		isAtEnd: false,
		originalRowHeight: 0, // Initialize with 0
		originalRowWidth: 0, // Initialize with 0
	};

	constructor(private config: DragConfig) {}

	/**
	 * Helper function to preserve background color and prevent transparency
	 */
	private preserveBackgroundColor(element: HTMLElement, computedStyles: CSSStyleDeclaration): string {
		const computedBackground = computedStyles.backgroundColor;

		// If computed background is transparent, try to get inline styles
		if (computedBackground === 'transparent' || computedBackground === 'rgba(0, 0, 0, 0)' || computedBackground === '') {
			const inlineBackground = element.style.backgroundColor;
			if (inlineBackground && inlineBackground !== 'transparent') {
				return inlineBackground;
			}
		}

		// If both computed and inline are transparent, return a fallback
		if (computedBackground === 'transparent' || computedBackground === 'rgba(0, 0, 0, 0)' || computedBackground === '') {
			return '#ffffff'; // Default white background as fallback
		}

		// Return the computed background if it's not transparent
		return computedBackground;
	}

	/**
	 * Initialize drag & drop for a table body element
	 */
	init(tbody: HTMLElement): void {
		// Store tbody reference
		this.tbody = tbody;
		// Add event listeners to all drag handles using delegation
		this.attachEventListeners(tbody);
	}

	/**
	 * Clean up all event listeners and state
	 */
	destroy(): void {
		//console.log('Destroying TableDragManager'); // Debug log
		this.cleanup();
		if (this.tbody) {
			this.tbody.removeEventListener('mousedown', this.handleMouseDown, true);
			this.tbody = null;
		}
	}

	private tbody: HTMLElement | null = null;

	private attachEventListeners(tbody: HTMLElement): void {
		// Remove any existing listeners first to prevent duplicates
		tbody.removeEventListener('mousedown', this.handleMouseDown, true);
		// Use event delegation - listen on tbody for mousedown events
		tbody.addEventListener('mousedown', this.handleMouseDown, true);
		//console.log('Attached event listeners to tbody'); // Debug log
	}

	private handleMouseDown = (event: MouseEvent): void => {
		const target = event.target as HTMLElement;

		// Check if the clicked element is a registered drag handle
		const registeredHandles = this.config.getDragHandles();
		const dragHandle = registeredHandles.find(handle => handle === target || handle.contains(target));

		if (!dragHandle || event.button !== 0) return;

		const row = dragHandle.closest('tr');
		const tbody = row?.closest('tbody');
		if (!row || !tbody) return;

		// Find the index of this row
		const allRows = Array.from(tbody.querySelectorAll('tr:not(.drop-gap)'));
		const index = allRows.indexOf(row);
		if (index === -1) return;

		// Disable dragging if there's only one row (nothing to reorder)
		if (allRows.length <= 1) {
			return;
		}

		this.state.dragSourceIndex = index;
		this.state.isDragging = true;
		this.state.dragElement = row;

		// Set global drag state
		isDragging.set(true);

		// Create clone
		this.createClone(row, event.clientX, event.clientY);

		// Hide original element
		row.style.display = 'none';

		// Trigger initial gap detection
		this.handleMouseMove(event);

		// Add global event listeners
		document.addEventListener('mousemove', this.handleMouseMove);
		document.addEventListener('mouseup', this.handleMouseUp);
		event.preventDefault();
		event.stopPropagation();
	};

	private createClone(row: HTMLElement, x: number, y: number): void {
		// Capture the original row dimensions BEFORE hiding it
		const originalRowRect = row.getBoundingClientRect();
		const computedStyles = window.getComputedStyle(row);

		// Try multiple methods to get the height
		let height = originalRowRect.height;
		if (height === 0) {
			// Fallback to computed styles
			height = parseFloat(computedStyles.height) || parseFloat(computedStyles.minHeight) || 0;
			console.log('getBoundingClientRect returned 0 height, using computed height:', height);
		}

		// Final fallback to a reasonable default
		if (height === 0) {
			height = 50; // Default row height
			console.log('All height detection failed, using default height:', height);
		}

		// Capture the exact width of the original row
		const originalRowWidth = originalRowRect.width;

		this.state.originalRowHeight = height;
		this.state.originalRowWidth = originalRowWidth;

		this.state.dragClone = row.cloneNode(true) as HTMLElement;
		const clone = this.state.dragClone;

		// Preserve the exact computed styles from the original row
		const originalStyles = window.getComputedStyle(row);
		const cloneStyles = window.getComputedStyle(clone);

		// Apply default styles
		clone.style.position = 'fixed'; // Use fixed instead of absolute
		clone.style.pointerEvents = 'none';
		clone.style.zIndex = '1000';
		clone.style.opacity = '0.9';
		clone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
		clone.className = 'dragged-row-clone'; // Add CSS class for additional styling

		// Preserve exact dimensions and layout
		clone.style.width = `${this.state.originalRowWidth}px`;
		clone.style.height = originalStyles.height;
		clone.style.minWidth = originalStyles.minWidth;
		clone.style.maxWidth = `${this.state.originalRowWidth}px`; // Use exact original width
		clone.style.minHeight = originalStyles.minHeight;
		clone.style.maxHeight = originalStyles.maxHeight;

		// Ensure width constraints are maintained for dragged state
		if (originalStyles.maxWidth && originalStyles.maxWidth !== 'none') {
			// Use the smaller of original maxWidth or actual row width
			const originalMaxWidth = parseFloat(originalStyles.maxWidth);
			if (!isNaN(originalMaxWidth) && originalMaxWidth < this.state.originalRowWidth) {
				clone.style.maxWidth = originalStyles.maxWidth;
			} else {
				clone.style.maxWidth = `${this.state.originalRowWidth}px`;
			}
		} else {
			// Set to exact original row width
			clone.style.maxWidth = `${this.state.originalRowWidth}px`;
		}

		// Preserve table layout properties
		clone.style.tableLayout = originalStyles.tableLayout;
		clone.style.borderCollapse = originalStyles.borderCollapse;
		clone.style.borderSpacing = originalStyles.borderSpacing;

		// Preserve flexbox and grid properties if they exist
		clone.style.display = originalStyles.display;
		clone.style.flexDirection = originalStyles.flexDirection;
		clone.style.justifyContent = originalStyles.justifyContent;
		clone.style.alignItems = originalStyles.alignItems;
		clone.style.flexWrap = originalStyles.flexWrap;
		clone.style.gap = originalStyles.gap;

		// Preserve overflow handling
		clone.style.overflow = originalStyles.overflow;
		clone.style.overflowX = originalStyles.overflowX;
		clone.style.overflowY = originalStyles.overflowY;

		// Preserve additional layout properties
		clone.style.boxSizing = originalStyles.boxSizing;
		clone.style.margin = originalStyles.margin;
		clone.style.padding = originalStyles.padding;
		clone.style.borderRadius = originalStyles.borderRadius;
		clone.style.transform = originalStyles.transform;
		clone.style.transition = 'none'; // Disable transitions during drag

		// Preserve the original background color instead of making it transparent
		clone.style.backgroundColor = this.preserveBackgroundColor(row, originalStyles);
		clone.style.border = originalStyles.border;

		// Preserve additional visual properties
		clone.style.color = originalStyles.color;
		clone.style.fontFamily = originalStyles.fontFamily;
		clone.style.fontSize = originalStyles.fontSize;
		clone.style.fontWeight = originalStyles.fontWeight;
		clone.style.textDecoration = originalStyles.textDecoration;

		// Apply custom styles if provided
		if (this.config.cloneStyles) {
			Object.assign(clone.style, this.config.cloneStyles);
		}

		// Copy exact column widths and preserve table structure
		const originalCells = row.querySelectorAll('td, th');
		const cloneCells = clone.querySelectorAll('td, th');

		originalCells.forEach((cell, i) => {
			if (cloneCells[i]) {
				const cellStyles = window.getComputedStyle(cell);
				const cloneCell = cloneCells[i] as HTMLElement;

				// Get the actual rendered width of the cell BEFORE any modifications
				const cellRect = cell.getBoundingClientRect();
				const actualCellWidth = cellRect.width;

				// Calculate padding to subtract from width
				const paddingLeft = parseFloat(cellStyles.paddingLeft) || 0;
				const paddingRight = parseFloat(cellStyles.paddingRight) || 0;
				const totalPadding = paddingLeft + paddingRight;
				const contentWidth = actualCellWidth - totalPadding;

				// Preserve exact cell dimensions with padding-adjusted width
				cloneCell.style.width = `${contentWidth}px`;
				cloneCell.style.height = cellStyles.height;
				cloneCell.style.minWidth = cellStyles.minWidth;
				cloneCell.style.maxWidth = `${contentWidth}px`; // Use padding-adjusted width
				cloneCell.style.minHeight = cellStyles.minHeight;
				cloneCell.style.maxHeight = cellStyles.maxHeight;

				// Preserve background color
				const preservedBackground = this.preserveBackgroundColor(cell as HTMLElement, cellStyles);
				cloneCell.style.backgroundColor = preservedBackground;
			}
		});

		// Create a temporary table wrapper to preserve table layout
		const tableWrapper = document.createElement('table');
		tableWrapper.style.position = 'fixed';
		tableWrapper.style.pointerEvents = 'none';
		tableWrapper.style.zIndex = '1000';
		tableWrapper.style.opacity = '0.9';
		tableWrapper.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
		tableWrapper.style.width = `${this.state.originalRowWidth}px`;
		tableWrapper.style.borderCollapse = 'collapse';
		tableWrapper.style.tableLayout = 'fixed';
		tableWrapper.className = 'dragged-row-clone';

		// Create tbody and add the row
		const tbody = document.createElement('tbody');
		tbody.appendChild(clone);
		tableWrapper.appendChild(tbody);

		// Add table wrapper to document body
		document.body.appendChild(tableWrapper);

		// Update state to reference the table wrapper
		this.state.dragClone = tableWrapper;

		// Position clone at mouse with boundary constraints
		this.updateClonePosition(x, y);
	}

	private updateClonePosition(x: number, y: number): void {
		if (!this.state.dragClone) return;

		// Constrain clone position to stay within table boundaries
		const tbody = this.state.dragElement?.closest('tbody');
		if (tbody) {
			const tbodyRect = tbody.getBoundingClientRect();
			const cloneRect = this.state.dragClone.getBoundingClientRect();

			// Calculate constrained position (fixed positioning is relative to viewport)
			let constrainedX = x - 10;
			let constrainedY = y - 20;

			// Ensure clone doesn't go outside table left boundary
			if (constrainedX < tbodyRect.left) {
				constrainedX = tbodyRect.left;
			}

			// Ensure clone doesn't go outside table right boundary
			if (constrainedX + cloneRect.width > tbodyRect.right) {
				constrainedX = tbodyRect.right - cloneRect.width;
			}

			// Ensure clone doesn't go outside table top boundary
			if (constrainedY < tbodyRect.top) {
				constrainedY = tbodyRect.top;
			}

			// Ensure clone doesn't go outside table bottom boundary
			if (constrainedY + cloneRect.height > tbodyRect.bottom) {
				constrainedY = tbodyRect.bottom - cloneRect.height;
			}

			// Apply constrained position
			this.state.dragClone.style.left = constrainedX + 'px';
			this.state.dragClone.style.top = constrainedY + 'px';
		} else {
			// Fallback to original positioning if no tbody found
			this.state.dragClone.style.left = x - 10 + 'px';
			this.state.dragClone.style.top = y - 20 + 'px';
		}
	}

	private handleMouseMove = (event: MouseEvent): void => {
		if (!this.state.isDragging || this.state.dragSourceIndex === null || !this.state.dragElement) return;

		const tbody = this.state.dragElement.closest('tbody');
		if (!tbody) return;

		const tbodyRect = tbody.getBoundingClientRect();

		// Debug: log mouse position and table boundaries
		console.log('Mouse position:', { x: event.clientX, y: event.clientY });
		console.log('Table boundaries:', {
			left: tbodyRect.left,
			right: tbodyRect.right,
			top: tbodyRect.top,
			bottom: tbodyRect.bottom,
		});

		// Update clone position (with boundary constraints applied in updateClonePosition)
		this.updateClonePosition(event.clientX, event.clientY);

		// Remove all previous drop gap elements
		document.querySelectorAll('tr.drop-gap').forEach(gap => gap.remove());
		this.state.isAtEnd = false;

		// Temporarily hide clone for detection
		if (this.state.dragClone) this.state.dragClone.style.display = 'none';
		const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
		if (this.state.dragClone) this.state.dragClone.style.display = '';

		const rowBelow = elementBelow?.closest('tr');
		const allRows = Array.from(tbody.querySelectorAll('tr:not(.drop-gap)'));

		// Check if we're at the top for dropping at the beginning
		const firstRow = allRows[0];
		if (firstRow && firstRow !== this.state.dragElement) {
			const firstRowRect = firstRow.getBoundingClientRect();
			const isAbove = event.clientY < firstRowRect.top;
			const isWithinTableX = event.clientX >= tbodyRect.left && event.clientX <= tbodyRect.right;
			const isNearTop = event.clientY < firstRowRect.top + firstRowRect.height * 0.5 && isWithinTableX;

			console.log('Top detection:', { isAbove, isWithinTableX, isNearTop, mouseY: event.clientY, firstRowTop: firstRowRect.top });

			if ((isAbove || isNearTop) && isWithinTableX) {
				console.log('Creating drop gap at top');
				this.state.dragOverIndex = 0;
				const dropGap = this.createDropGap();
				tbody.insertBefore(dropGap, firstRow);
				return;
			}
		}

		// Check if we're at the bottom for dropping at the end
		const lastRow = allRows[allRows.length - 1];
		if (lastRow && lastRow !== this.state.dragElement) {
			const lastRowRect = lastRow.getBoundingClientRect();
			const isBelow = event.clientY > lastRowRect.bottom;
			const isWithinTableX = event.clientX >= tbodyRect.left && event.clientX <= tbodyRect.right;
			const isNearBottom = event.clientY > lastRowRect.bottom - lastRowRect.height * 0.5 && isWithinTableX;

			console.log('Bottom detection:', { isBelow, isWithinTableX, isNearBottom, mouseY: event.clientY, lastRowBottom: lastRowRect.bottom });

			if ((isBelow || isNearBottom) && isWithinTableX) {
				console.log('Creating drop gap at bottom');
				this.state.dragOverIndex = allRows.length;
				this.state.isAtEnd = true;
				const dropGap = this.createDropGap();
				tbody.appendChild(dropGap);
				return;
			}
		}

		// Check if we're hovering over a specific row (middle area)
		if (rowBelow && rowBelow !== this.state.dragElement && !rowBelow.classList.contains('drop-gap')) {
			const newIndex = allRows.indexOf(rowBelow);
			if (newIndex !== -1 && newIndex !== this.state.dragSourceIndex) {
				const rowRect = rowBelow.getBoundingClientRect();
				const rowMiddle = rowRect.top + rowRect.height / 2;

				if (event.clientY < rowMiddle) {
					this.state.dragOverIndex = newIndex;
				} else {
					this.state.dragOverIndex = newIndex + 1;
				}

				const dropGap = this.createDropGap();

				if (event.clientY < rowMiddle) {
					rowBelow.parentNode?.insertBefore(dropGap, rowBelow);
				} else {
					const nextRow = rowBelow.nextElementSibling;
					if (nextRow) {
						rowBelow.parentNode?.insertBefore(dropGap, nextRow);
					} else {
						tbody.appendChild(dropGap);
					}
				}
			}
		}

		// If no drop indicator was created but we're still dragging, ensure one is visible
		// This handles edge cases where the mouse might be in a dead zone
		if (this.state.isDragging && !document.querySelector('tr.drop-gap')) {
			console.log('No drop gap found, creating fallback indicator');
			const allRows = Array.from(tbody.querySelectorAll('tr:not(.drop-gap)'));
			if (allRows.length > 0) {
				// Determine the best position based on mouse Y position
				const tbodyRect = tbody.getBoundingClientRect();
				const mouseY = event.clientY;
				const tbodyMiddle = tbodyRect.top + tbodyRect.height / 2;

				console.log('Fallback positioning:', { mouseY, tbodyMiddle, tbodyTop: tbodyRect.top, tbodyBottom: tbodyRect.bottom });

				if (mouseY < tbodyMiddle) {
					// Insert at the beginning
					console.log('Fallback: inserting at beginning');
					this.state.dragOverIndex = 0;
					const dropGap = this.createDropGap();
					tbody.insertBefore(dropGap, allRows[0]);
				} else {
					// Insert at the end
					console.log('Fallback: inserting at end');
					this.state.dragOverIndex = allRows.length;
					this.state.isAtEnd = true;
					const dropGap = this.createDropGap();
					tbody.appendChild(dropGap);
				}
			}
		}
	};

	private createDropGap(): HTMLElement {
		const dropGap = document.createElement('tr');
		dropGap.className = 'drop-gap';

		// Use the stored original row height instead of trying to get it from hidden element
		let dropIndicatorHeight = '30px'; // Default height
		console.log('createDropGap - stored originalRowHeight:', this.state.originalRowHeight);
		console.log('createDropGap - dragElement:', this.state.dragElement);

		if (this.state.originalRowHeight > 0) {
			dropIndicatorHeight = `${this.state.originalRowHeight}px`;
			console.log('Using stored original row height for drop indicator:', dropIndicatorHeight);
		} else {
			console.warn('No stored row height, using default height');
			// Try to get height from dragElement if available
			if (this.state.dragElement) {
				const dragElementRect = this.state.dragElement.getBoundingClientRect();
				console.log('dragElement getBoundingClientRect:', dragElementRect);
				if (dragElementRect.height > 0) {
					dropIndicatorHeight = `${dragElementRect.height}px`;
					console.log('Using dragElement height as fallback:', dropIndicatorHeight);
				}
			}
		}

		// Also set the row height to match
		dropGap.style.height = dropIndicatorHeight;
		console.log('Final dropGap height set to:', dropIndicatorHeight);

		// Debug: log the column count being used
		console.log('Creating drop gap with column count:', this.config.columnCount);

		const innerHTML = this.config.dropIndicatorHTML || `<td colspan="${this.config.columnCount}" class="drop-indicator" style="height: ${dropIndicatorHeight};"></td>`;

		dropGap.innerHTML = innerHTML;

		// Debug: log the created HTML
		console.log('Drop gap HTML:', dropGap.outerHTML);

		return dropGap;
	}

	private handleMouseUp = (): void => {
		if (!this.state.isDragging || this.state.dragSourceIndex === null) return;

		// Remove all gap elements
		document.querySelectorAll('tr.drop-gap').forEach(gap => gap.remove());

		// Remove clone from document body
		if (this.state.dragClone && document.body.contains(this.state.dragClone)) {
			document.body.removeChild(this.state.dragClone);
		}

		// Reset drag element styles
		if (this.state.dragElement) {
			this.state.dragElement.style.display = '';
			this.state.dragElement.style.opacity = '';
		}

		// Perform reorder if needed
		if (this.state.dragOverIndex !== null && this.state.dragOverIndex !== this.state.dragSourceIndex) {
			let targetIndex = this.state.dragOverIndex;
			if (this.state.dragOverIndex > this.state.dragSourceIndex) {
				targetIndex = this.state.dragOverIndex - 1;
			}
			this.config.onReorder(this.state.dragSourceIndex, targetIndex);
		}

		this.cleanup();
	};

	private cleanup(): void {
		// Remove all gap elements
		document.querySelectorAll('tr.drop-gap').forEach(gap => gap.remove());

		// Remove clone from document body
		if (this.state.dragClone) {
			if (document.body.contains(this.state.dragClone)) {
				document.body.removeChild(this.state.dragClone);
			}
			this.state.dragClone = null;
		}

		// Reset drag element styles
		if (this.state.dragElement) {
			this.state.dragElement.style.display = '';
			this.state.dragElement.style.opacity = '';
			this.state.dragElement = null;
		}

		// Reset state
		this.state.dragSourceIndex = null;
		this.state.dragOverIndex = null;
		this.state.isDragging = false;
		this.state.isAtEnd = false;
		this.state.originalRowHeight = 0; // Reset original row height
		this.state.originalRowWidth = 0; // Reset original row width

		// Reset global drag state
		isDragging.set(false);

		// Remove event listeners
		document.removeEventListener('mousemove', this.handleMouseMove);
		document.removeEventListener('mouseup', this.handleMouseUp);
	}

	/**
	 * Get current drag state (useful for reactive frameworks)
	 */
	getState(): Readonly<DragState> {
		return { ...this.state };
	}
}

/**
 * Utility function to create default CSS for drop indicators
 */
export function createDropIndicatorCSS(): string {
	return `
		tr.drop-gap {
			background: transparent !important;
			border: none !important;
		}

		tr.drop-gap td {
			border: none !important;
			padding: 0 !important;
		}

		.drop-indicator {
			background: rgba(var(--primary-rgb, 74, 144, 226), 0.1) !important;
			border: 2px dashed var(--primary) !important;
			border-radius: 4px !important;
			margin: 2px 4px !important;
			width: 100% !important;
			box-sizing: border-box !important;
			/* Height will be set dynamically via inline styles */
			min-height: 20px !important; /* Minimum height for very small elements */
		}
	`;
}
