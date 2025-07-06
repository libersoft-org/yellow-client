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
		align?: 'left' | 'center' | 'right';
		expand?: boolean;
	}
	let { children, title, 'data-testid': dataTestId, padding = '10px', shorten = false, colspan, style, align = 'left', expand = false }: Props = $props();
</script>

<style>
	td {
		gap: 20px;
		text-align: left;
		border: 0;
		white-space: nowrap;
		width: auto;
	}

	td.expand {
		width: 100%;
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
		width: 100%;
		justify-content: flex-start;
	}

	td[style*='text-align: center'] > :global(div) {
		justify-content: center;
	}

	td[style*='text-align: right'] > :global(div) {
		justify-content: flex-end;
	}

	td:before {
		display: inline-block;
		width: 15vw;
		max-width: 300px;
	}

	td[data-title]:before {
		content: attr(data-title) ':\00A0';
		font-weight: bold;
	}

	td:empty {
		display: none;
	}
</style>

<td data-title={title} data-testid={dataTestId} style:padding class:shorten class:expand {colspan} {style} style:text-align={align}>
	{@render children?.()}
</td>
