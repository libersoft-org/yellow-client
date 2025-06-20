<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>

<style>
	.content-page {
		flex: 1;
		height: 100%;
		padding: 10px;
		overflow: auto;
		color: var(--primary-foreground);
	}
</style>

<div class="content-page">
	{@render children?.()}
</div>
