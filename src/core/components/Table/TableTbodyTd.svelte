<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		title?: string;
		'data-testid'?: string;
		padding?: string;
		shorten?: boolean;
		colspan?: number;
		style?: string;
	}
	let { children, title, 'data-testid': dataTestId, padding = '10px', shorten = false, colspan, style }: Props = $props();
</script>

<style>
	td {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 20px;
		text-align: left;
		border: 0;
		white-space: normal;
	}

	td.shorten {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	td > :global(div) {
		display: flex;
		align-items: center;
	}

	:global(.table-wide) td {
		display: table-cell;
		white-space: nowrap;
		border-style: none;
		text-align: left !important;
		min-width: 50px;
		vertical-align: middle;
	}

	:global(.table-wide) td {
		display: table-cell;
		width: 100%;
	}

	td:before {
		display: inline-block;
		width: 15vw;
		max-width: 300px;
	}

	:global(.table-wide) td:before {
		display: table;
		width: 100%;
	}

	td[data-title]:before {
		content: attr(data-title) ':\00A0';
		font-weight: bold;
	}

	:global(.table-wide) td[data-title]:before {
		content: '';
		font-weight: bold;
	}

	td:empty {
		display: none;
	}

	:global(.table-wide) td:empty {
		display: table-cell;
	}
</style>

<td data-title={title} data-testid={dataTestId} style:padding class:shorten {colspan} {style}>
	{@render children?.()}
</td>
