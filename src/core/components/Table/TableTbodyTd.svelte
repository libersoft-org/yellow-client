<script lang="ts">
	import type { Snippet } from 'svelte';
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
		class?: string;
	}
	let { children, title, 'data-testid': dataTestId, padding = '10px', colspan, style, align = 'left', expand = false, bold = false, class: className }: Props = $props();

	let tdElement: HTMLTableCellElement;
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
		overflow: hidden;
	}

	td.expand-balance {
		width: 100%;
	}

	td.currency-column-wide {
		width: 100%;
	}

	@media (min-width: 768px) {
		td.currency-column-wide {
			width: 65%;
		}
	}

	td.network-icon-cell {
		padding-right: 10px !important;
	}

	/* Global ellipsis utility for table cells */
	:global(.ellipsis) {
		position: relative;
		width: 100%;
	}

	:global(.ellipsis.ellipsis-50) {
		width: 50%;
	}

	:global(.ellipsis > *:first-child) {
		position: absolute;
		left: 10px;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: inline-block;
	}

	:global(.ellipsis::before) {
		content: 'X'; /* one character for height reference */
		visibility: hidden; /* doesn’t show, but contributes to layout */
		display: block;
		padding: 10px 0; /* vertical padding = cell height */
		white-space: nowrap; /* same as text */
	}

	/* Global utility classes for icon+text layouts inside table cells */
	:global(.ellipsis .td__row) {
		display: inline-grid;
		grid-auto-flow: column;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 10px;
		max-width: 100%;
	}

	:global(.td__icon) {
		flex: 0 0 auto;
	}

	:global(.td__text) {
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	td :global(.drag-handle) {
		margin-top: 2px;
	}

	td:not(.ellipsis) > :global(*) {
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

<td bind:this={tdElement} data-title={title} data-testid={dataTestId} style:padding class:expand class:bold class={className} {colspan} {style} style:text-align={align}>
	{@render children?.()}
</td>
