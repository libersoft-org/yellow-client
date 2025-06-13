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
		gap: 10px;
		width: 100%;
	}
</style>

<div class="button-bar">
	{@render children?.()}
</div>
