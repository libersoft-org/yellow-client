<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		title?: string;
		'data-testid'?: string;
		shorten?: boolean;
	}
	let { children, title, 'data-testid': dataTestId, shorten = false }: Props = $props();
</script>

<style>
	td {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 20px;
		padding: 10px;
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
		padding: 10px !important;
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

<td data-title={title} data-testid={dataTestId} class:shorten>
	{@render children?.()}
</td>
