<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>

<style>
	.tabs {
		display: flex;
		border-radius: 10px;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		overflow: hidden;
	}
</style>

<div class="tabs">
	{#if children}
		{@render children?.()}
	{/if}
</div>
