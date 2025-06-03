<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children: Snippet;
		background?: string;
		hover?: boolean;
	}

	const { children, background = 'var(--primary-soft-background)', hover = true }: Props = $props();
</script>

<style>
	tr:nth-child(even) {
		background-color: var(--primary-soft-background);
	}

	tr:nth-child(odd) {
		background-color: var(--primary-softer-background) !important;
	}

	tr.hover {
		&:hover {
			background-color: var(--primary-background) !important;
		}
	}
</style>

<tr class:hover style:background>
	{@render children()}
</tr>
