<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		hiddenOnMobile?: boolean;
	}
	const { children, hiddenOnMobile = false }: Props = $props();
</script>

<style>
	thead.hiddenOnMobile {
		display: none;
	}
</style>

<thead class:hidden-on-mobile={hiddenOnMobile}>
	{@render children?.()}
</thead>
