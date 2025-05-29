<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		background?: string;
		hover?: boolean;
	};

	const { children, background = 'var(--color-primary-soft-background)', hover = true }: Props = $props();
</script>

<style>
	tr:nth-child(even) {
		background-color: var(--color-primary-soft-background);
	}

	tr:nth-child(odd) {
		background-color: var(--color-primary-softer-background) !important;
	}

	tr.hover {
		&:hover {
			background-color: var(--color-primary-background) !important;
		}
	}
</style>

<tr class:hover style:background>
	{@render children()}
</tr>
