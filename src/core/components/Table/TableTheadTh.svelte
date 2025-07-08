<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		align?: 'left' | 'center' | 'right';
		padding?: string;
		colspan?: number | string;
	}
	let cs: number | undefined = $state();
	const { children, align = 'left', colspan, padding = '10px' }: Props = $props();

	$effect(() => {
		if (colspan) cs = Number(colspan);
	});
</script>

<style>
	th {
		padding: 10px;
	}
</style>

<th style:text-align={align} colspan={cs} style:padding>
	{@render children?.()}
</th>
