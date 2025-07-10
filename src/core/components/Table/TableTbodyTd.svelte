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
		bold?: boolean;
	}
	let { children, title, 'data-testid': dataTestId, padding = '10px', shorten = false, colspan, style, align = 'left', expand = false, bold = false }: Props = $props();
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
	}

	td.shorten {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	td :global(*) {
		display: inline-block;
	}

	td > :global(*) {
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

<td data-title={title} data-testid={dataTestId} style:padding class:shorten class:expand class:bold {colspan} {style} style:text-align={align}>
	{@render children?.()}
</td>
