<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		backgroundColor?: string;
		color?: string;
	}
	const { children, backgroundColor = '--primary-background', color = '--primary-foreground' }: Props = $props();
</script>

<style>
	tr {
		background-color: var(--primary-background);
		color: var(--primary-foreground);
	}
</style>

<tr style="background-color: var({backgroundColor}); color: var({color});">
	{@render children?.()}
</tr>
