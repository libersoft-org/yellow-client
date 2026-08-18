<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		hiddenOnMobile?: boolean;
		hiddenOnDesktop?: boolean;
	}
	const { children, hiddenOnMobile = false, hiddenOnDesktop = false }: Props = $props();
</script>

<style>
	thead.hidden-on-mobile {
		display: none;
	}

	thead.hidden-on-desktop {
		display: none;
	}
</style>

<thead class:hidden-on-mobile={hiddenOnMobile} class:hidden-on-desktop={hiddenOnDesktop}>
	{@render children?.()}
</thead>
