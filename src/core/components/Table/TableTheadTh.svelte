<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		align?: 'left' | 'center' | 'right';
		padding?: string;
		colspan?: number | string;
		expand?: boolean;
	}
	let cs: number | undefined = $state();
	const { children, align = 'left', colspan, padding = '10px', expand = false }: Props = $props();

	$effect(() => {
		if (colspan) cs = Number(colspan);
	});
</script>

<style>
	th.expand {
		width: 100%;
		white-space: normal;
	}

	th :global(*) {
		display: inline-block;
	}
</style>

<th style:text-align={align} colspan={cs} style:padding class:expand>
	{@render children?.()}
</th>
