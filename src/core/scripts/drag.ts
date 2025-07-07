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
}

export class TableDragManager {
	private state: DragState = {
		dragSourceIndex: null,
		dragOverIndex: null,
		isDragging: false,
		dragElement: null,
		dragClone: null,
		isAtEnd: false,
	};

	constructor(private config: DragConfig) {}

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
		console.log('Destroying TableDragManager'); // Debug log
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
		console.log('Attached event listeners to tbody'); // Debug log
	}

	private handleMouseDown = (event: MouseEvent): void => {
		const target = event.target as HTMLElement;

		// Check if the clicked element is a registered drag handle
		const registeredHandles = this.config.getDragHandles();
		const dragHandle = registeredHandles.find(handle => handle === target || handle.contains(target));

		if (!dragHandle || event.button !== 0) return;

		console.log('Drag handle clicked:', dragHandle); // Debug log

		const row = dragHandle.closest('tr');
		const tbody = row?.closest('tbody');
		if (!row || !tbody) return;

		// Find the index of this row
		const allRows = Array.from(tbody.querySelectorAll('tr:not(.drop-gap)'));
		const index = allRows.indexOf(row);
		if (index === -1) return;

		console.log('Starting drag for row index:', index); // Debug log

		this.state.dragSourceIndex = index;
		this.state.isDragging = true;
		this.state.dragElement = row;

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
		this.state.dragClone = row.cloneNode(true) as HTMLElement;
		const clone = this.state.dragClone;

		// Apply default styles
		clone.style.position = 'fixed'; // Use fixed instead of absolute
		clone.style.pointerEvents = 'none';
		clone.style.zIndex = '1000';
		clone.style.opacity = '0.8';
		clone.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
		clone.style.width = row.offsetWidth + 'px';
		clone.style.backgroundColor = 'var(--background)';
		clone.style.border = '1px solid var(--border)';

		// Apply custom styles if provided
		if (this.config.cloneStyles) {
			Object.assign(clone.style, this.config.cloneStyles);
		}

		// Copy column widths to maintain alignment
		const originalCells = row.querySelectorAll('td');
		const cloneCells = clone.querySelectorAll('td');
		originalCells.forEach((cell, i) => {
			if (cloneCells[i]) {
				const width = cell.offsetWidth + 'px';
				cloneCells[i].style.width = width;
				cloneCells[i].style.minWidth = width;
				cloneCells[i].style.maxWidth = width;
			}
		});

		// Add clone to document body instead of tbody
		document.body.appendChild(clone);

		// Position clone at mouse
		this.updateClonePosition(x, y);
	}

	private updateClonePosition(x: number, y: number): void {
		if (!this.state.dragClone) return;

		// Use fixed positioning for smoother movement
		this.state.dragClone.style.left = x - 10 + 'px';
		this.state.dragClone.style.top = y - 20 + 'px';
	}

	private handleMouseMove = (event: MouseEvent): void => {
		if (!this.state.isDragging || this.state.dragSourceIndex === null || !this.state.dragElement) return;

		// Update clone position
		this.updateClonePosition(event.clientX, event.clientY);

		// Remove all previous drop gap elements
		document.querySelectorAll('tr.drop-gap').forEach(gap => gap.remove());
		this.state.isAtEnd = false;

		// Temporarily hide clone for detection
		if (this.state.dragClone) this.state.dragClone.style.display = 'none';
		const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
		if (this.state.dragClone) this.state.dragClone.style.display = '';

		const rowBelow = elementBelow?.closest('tr');
		const tbody = this.state.dragElement.closest('tbody');
		if (!tbody) return;

		const allRows = Array.from(tbody.querySelectorAll('tr:not(.drop-gap)'));
		const tbodyRect = tbody.getBoundingClientRect();

		// Check if we're at the top for dropping at the beginning
		const firstRow = allRows[0];
		if (firstRow && firstRow !== this.state.dragElement) {
			const firstRowRect = firstRow.getBoundingClientRect();
			const isAbove = event.clientY < firstRowRect.top;
			const isWithinTableX = event.clientX >= tbodyRect.left && event.clientX <= tbodyRect.right;
			const isNearTop = event.clientY < firstRowRect.top + firstRowRect.height * 0.3 && isWithinTableX;
			const isOutsideTable = event.clientX < tbodyRect.left || event.clientX > tbodyRect.right || event.clientY < tbodyRect.top;

			if (isAbove || isNearTop || (isOutsideTable && event.clientY < firstRowRect.bottom)) {
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
			const isNearBottom = event.clientY > lastRowRect.bottom - lastRowRect.height * 0.3 && isWithinTableX;
			const isOutsideTable = event.clientX < tbodyRect.left || event.clientX > tbodyRect.right || event.clientY > tbodyRect.bottom;

			if (isBelow || isNearBottom || (isOutsideTable && event.clientY > lastRowRect.top)) {
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
	};

	private createDropGap(): HTMLElement {
		const dropGap = document.createElement('tr');
		dropGap.className = 'drop-gap';

		const innerHTML = this.config.dropIndicatorHTML || `<td colspan="${this.config.columnCount}" class="drop-indicator"></td>`;

		dropGap.innerHTML = innerHTML;
		return dropGap;
	}

	private handleMouseUp = (): void => {
		if (!this.state.isDragging || this.state.dragSourceIndex === null) return;

		console.log('Mouse up - completing drag operation'); // Debug log

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
			console.log('Performing reorder from', this.state.dragSourceIndex, 'to', targetIndex); // Debug log
			this.config.onReorder(this.state.dragSourceIndex, targetIndex);
		}

		this.cleanup();
	};

	private cleanup(): void {
		console.log('Cleaning up drag state'); // Debug log

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
			height: 30px !important;
			background: rgba(var(--primary-rgb, 74, 144, 226), 0.1) !important;
			border: 2px dashed var(--primary) !important;
			border-radius: 4px !important;
			margin: 2px 4px !important;
			display: block !important;
		}
	`;
}
