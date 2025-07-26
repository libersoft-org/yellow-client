<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		align?: 'left' | 'center' | 'right';
	}

	const { children, align = 'left' }: Props = $props();
</script>

<style>
	.action-items {
		display: flex;
	}
</style>

<div class="action-items" style="justify-content: {align};">
	{@render children?.()}
</div>
