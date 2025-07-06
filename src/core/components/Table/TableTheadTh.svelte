<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		align?: 'left' | 'center' | 'right';
		colspan?: number;
	}
	const { children, align = 'left', colspan }: Props = $props();
</script>

<style>
	th {
		padding: 10px;
	}
</style>

<th style:text-align={align} {colspan}>
	{@render children?.()}
</th>
