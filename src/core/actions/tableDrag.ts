import { TableDragManager, type DragConfig } from '@/core/scripts/drag.ts';

export interface TableDragOptions {
	/** Numbe		update(newOptions: TableDragOptions) {
			console.log('tableDrag: Update called', {
				oldLength: currentItemsLength,
				newLength: newOptions.items?.length,
			});

			// Always reinitialize to ensure clean state
			options = newOptions;
			init();
			
			// Update drag handle states after initialization
			updateDragHandleStates();
		},s in the table for colspan (auto-detected if not provided) */
	columnCount?: number;
	/** Callback when reordering is needed */
	onReorder: (sourceIndex: number, targetIndex: number) => void;
	/** Items array for reactive updates */
	items: any[];
}

// Track if styles are already injected
let stylesInjected = false;

// Registry for drag handles
const dragHandleRegistry = new Set<HTMLElement>();

export function registerDragHandle(element: HTMLElement) {
	dragHandleRegistry.add(element);
}

export function unregisterDragHandle(element: HTMLElement) {
	dragHandleRegistry.delete(element);
}

function injectDragStyles() {
	if (stylesInjected) return;

	const styleId = 'table-drag-styles';
	if (document.getElementById(styleId)) return;

	const style = document.createElement('style');
	style.id = styleId;
	style.textContent = `
		/* Gap elements for drag and drop */
		tr.drop-gap {
			background: transparent !important;
			border: none !important;
			width: 100% !important;
		}

		tr.drop-gap td {
			border: none !important;
			padding: 0 !important;
			width: 100% !important;
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

		/* Ensure dragged table rows maintain their structure */
		.dragged-row-clone {
			table-layout: fixed !important;
			width: auto !important;
			height: auto !important;
			background-color: #ffffff !important; /* Ensure default background */
			display: table-row !important; /* Force table row display */
			overflow: hidden !important; /* Prevent content overflow */
		}

		.dragged-row-clone td,
		.dragged-row-clone th {
			white-space: nowrap !important;
			overflow: hidden !important;
			text-overflow: ellipsis !important;
			background-color: inherit !important; /* Inherit from parent */
			display: table-cell !important; /* Force table cell display */
			vertical-align: middle !important; /* Ensure proper vertical alignment */
		}
		
		/* Special handling for shorten class in dragged clones */
		.dragged-row-clone td.shorten {
			display: table-cell !important; /* Override flex display */
			align-items: center !important;
			min-width: 0 !important;
			overflow: hidden !important;
			padding: 10px !important;
		}
		
		.dragged-row-clone td.shorten .ellipsis {
			display: block !important;
			width: 100% !important;
			overflow: hidden !important;
			text-overflow: ellipsis !important;
			white-space: nowrap !important;
			min-width: 0 !important;
		}
		
		/* Ensure ellipsis works in both normal and dragged states */
		td.shorten .ellipsis,
		.dragged-row-clone td.shorten .ellipsis {
			display: block !important;
			width: 100% !important;
			overflow: hidden !important;
			text-overflow: ellipsis !important;
			white-space: nowrap !important;
			min-width: 0 !important;
		}
		
		/* Disabled drag handles when only one row */
		.drag-handle.disabled {
			opacity: 0.5 !important;
			cursor: not-allowed !important;
			pointer-events: none !important;
		}
		
		/* Ensure table structure is maintained in clones */
		table:has(tr.drop-gap) {
			table-layout: fixed !important;
			width: 100% !important;
		}
	`;

	document.head.appendChild(style);
	stylesInjected = true;
}

/**
 * Svelte action for table drag & drop functionality
 * Usage: <div use:tableDrag={options}>
 */
export function tableDrag(node: HTMLElement, options: TableDragOptions) {
	let dragManager: TableDragManager | undefined;
	let currentItemsLength = 0;

	function init() {
		cleanup(); // Always cleanup first

		if (!options.items?.length) {
			console.log('tableDrag: No items to work with');
			return;
		}

		// Inject required styles
		injectDragStyles();

		// Find tbody within the node
		const tbody = node.querySelector('tbody');
		if (!tbody) {
			console.warn('tableDrag: No tbody found in element');
			return;
		}

		// Auto-detect column count if not provided
		let columnCount = options.columnCount;
		if (!columnCount) {
			const firstRow = tbody.querySelector('tr');
			if (firstRow) {
				columnCount = firstRow.querySelectorAll('td, th').length;
				//console.log('tableDrag: Auto-detected column count:', columnCount);
			} else {
				console.warn('tableDrag: Could not auto-detect column count, defaulting to 1');
				columnCount = 1;
			}
		}

		// Create new drag manager
		const config: DragConfig = {
			getDragHandles: () => Array.from(dragHandleRegistry),
			columnCount: columnCount,
			onReorder: options.onReorder,
		};

		dragManager = new TableDragManager(config);
		dragManager.init(tbody);
		currentItemsLength = options.items.length;

		// Update drag handle states based on item count
		updateDragHandleStates();

		//console.log('tableDrag: Initialized for', options.items.length, 'items');
	}

	function updateDragHandleStates() {
		const isDisabled = options.items.length <= 1;

		// Update all registered drag handles
		dragHandleRegistry.forEach(handle => {
			if (isDisabled) {
				handle.classList.add('disabled');
				handle.setAttribute('title', 'Cannot reorder: only one item');
			} else {
				handle.classList.remove('disabled');
				handle.removeAttribute('title');
			}
		});

		console.log('tableDrag: Drag handles', isDisabled ? 'disabled' : 'enabled', 'for', options.items.length, 'items');
	}

	function cleanup() {
		if (dragManager) {
			dragManager.destroy();
			dragManager = undefined;
		}
	}

	// Initialize on mount
	init();

	return {
		update(newOptions: TableDragOptions) {
			console.log('tableDrag: Update called', {
				oldLength: currentItemsLength,
				newLength: newOptions.items?.length,
			});

			// Always reinitialize to ensure clean state
			options = newOptions;
			init();

			// Update drag handle states after initialization
			updateDragHandleStates();
		},
		destroy() {
			//console.log('tableDrag: Destroying');
			cleanup();
		},
	};
}
