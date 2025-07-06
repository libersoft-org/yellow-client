<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		breakpoint?: string | null;
		hideBorder?: boolean;
		[key: string]: unknown;
	}
	const { breakpoint = null, children, hideBorder = false, ...restProps }: Props = $props();
	let isWide = $state(false);

	$effect(() => {
		if (!breakpoint) return;
		const mql = matchMedia(`(min-width: ${breakpoint})`);
		isWide = mql.matches;
		mql.addEventListener('change', e => (isWide = e.matches));
	});
</script>

<style>
	table {
		box-sizing: border-box;
		width: 100%;
		max-width: 100vw;
		overflow: hidden;
		border: 1px solid var(--secondary-background);
		border-radius: 10px;
	}

	table.hide-border {
		border: none;
	}

	table.expand {
		width: 100%;
	}
</style>

<div class="table" class:expand={isWide} class:hide-border={hideBorder} {...restProps}>
	<table>
		{@render children?.()}
	</table>
</div>
