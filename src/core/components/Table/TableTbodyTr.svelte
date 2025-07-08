<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	import { isDragging } from '@/core/scripts/drag.ts';
	interface Props {
		children?: Snippet;
		background?: string;
		hover?: boolean;
		onClick?: MouseEventHandler<HTMLTableRowElement>;
	}
	const { children, background = 'var(--primary-soft-background)', hover = true, onClick }: Props = $props();

	function handleKeyDown(e: KeyboardEvent) {
		if (!onClick) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick(e as any);
		}
	}
</script>

<style>
	tr {
		color: var(--primary-foreground);
	}

	tr:nth-child(even) {
		background-color: var(--primary-soft-background);
	}

	tr:nth-child(odd) {
		background-color: var(--primary-softer-background) !important;
	}

	tr.hover:hover {
		background-color: var(--primary-hard-background) !important;
	}

	tr.clickable {
		cursor: pointer;
	}

	tr.clickable:focus {
		outline: 2px solid var(--primary-harder-background);
		border-radius: 10px;
	}
</style>

<tr class:hover={hover && !$isDragging} class:clickable={!!onClick} style:background onclick={onClick} onkeydown={onClick ? handleKeyDown : undefined} role={onClick ? 'button' : undefined} tabindex={onClick ? 0 : undefined}>
	{@render children?.()}
</tr>
