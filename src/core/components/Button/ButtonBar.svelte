<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>

<style>
	.button-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
	}
</style>

<div class="button-bar">
	{@render children?.()}
</div>
