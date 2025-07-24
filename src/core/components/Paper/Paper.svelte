<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isMobile, mobileWidth } from '@/core/scripts/stores.ts';
	interface Props {
		children?: Snippet;
	}
	const { children }: Props = $props();
</script>

<style>
	.paper {
		display: flex;
		flex-direction: column;
		gap: 10px;
		box-sizing: border-box;
		width: 100%;
		padding: 10px;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		background: var(--default-background);
		color: var(--default-foreground);
		box-shadow: var(--shadow);
	}

	.paper.mobile {
		border-radius: 0;
		border: none;
		box-shadow: none;
	}
</style>

<div class="paper" class:mobile={$isMobile} style:max-width={$mobileWidth}>
	{@render children?.()}
</div>
