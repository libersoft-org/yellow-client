<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--background-image) 0 0 / 400px repeat;
	}
</style>

<div class="content">
	{@render children?.()}
</div>
