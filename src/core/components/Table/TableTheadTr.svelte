<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<style>
	tr {
		background-color: var(--primary-background);
	}
</style>

<tr>
	{@render children()}
</tr>
