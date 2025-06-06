<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>

<style>
	.content {
		flex: 1;
		height: 100%;
		padding: 10px;
		overflow: auto;
	}
</style>

<div class="content">
	{@render children?.()}
</div>
