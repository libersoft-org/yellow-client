import { TableDragManager, type DragConfig } from '@/core/scripts/drag.ts';

export interface TableDragOptions {
	/** Selector for the drag handle within each row */
	dragHandleSelector?: string;
	/** Number of columns in the table for colspan */
	columnCount: number;
	/** Callback when reordering is needed */
	onReorder: (sourceIndex: number, targetIndex: number) => void;
	/** Items array for reactive updates */
	items: any[];
	/** Whether drag is enabled */
	enabled?: boolean;
}

// Track if styles are already injected
let stylesInjected = false;

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

		if (!options.enabled || !options.items?.length) {
			console.log('tableDrag: Disabled or no items');
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

		// Create new drag manager
		const config: DragConfig = {
			dragHandleSelector: options.dragHandleSelector || '.drag-handle',
			columnCount: options.columnCount,
			onReorder: options.onReorder,
		};

		dragManager = new TableDragManager(config);
		dragManager.init(tbody);
		currentItemsLength = options.items.length;

		console.log('tableDrag: Initialized for', options.items.length, 'items');
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
				enabled: newOptions.enabled,
			});

			// Always reinitialize to ensure clean state
			options = newOptions;
			init();
		},
		destroy() {
			console.log('tableDrag: Destroying');
			cleanup();
		},
	};
}
