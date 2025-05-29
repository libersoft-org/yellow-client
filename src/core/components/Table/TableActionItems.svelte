<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();
</script>

<div class="action-items">
	{@render children()}
</div>

<style>
	.action-items {
		display: flex;
	}
</style>
