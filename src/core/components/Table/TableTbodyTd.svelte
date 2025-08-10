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
		display: flex;
		align-items: center;
		min-width: 0;
		overflow: hidden;
		padding: 10px;
	}

	td.shorten .ellipsis {
		flex: 1 1 0%;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}

	.ellipsis {
		display: block;
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
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

	:global(.ellipsis) {
		flex: 1 1 0%;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}
</style>

<td data-title={title} data-testid={dataTestId} style:padding class:shorten class:expand class:bold {colspan} {style} style:text-align={align}>
	{#if shorten}
		<span class="ellipsis">{@render children?.()}</span>
	{:else}
		{@render children?.()}
	{/if}
</td>
