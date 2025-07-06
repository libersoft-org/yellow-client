<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		align?: 'left' | 'center' | 'right';
	}
	const { children, align = 'left' }: Props = $props();
</script>

<style>
	th {
		padding: 10px;
	}
</style>

<th style:text-align={align}>
	{@render children?.()}
</th>
