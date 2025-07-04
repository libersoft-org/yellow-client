<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';

	interface Props {
		children?: Snippet;
		dndzone?: {
			items: any[];
			flipDurationMs?: number;
			dropTargetStyle?: any;
		};
		onconsider?: (e: any) => void;
		onfinalize?: (e: any) => void;
	}
	const { children, dndzone: dndOptions, onconsider, onfinalize }: Props = $props();
</script>

<style>
	:global(.table-wide) tbody {
		display: table-row-group;
		border-style: none;
		border-bottom-width: 0;
	}
</style>

{#if dndOptions}
	<tbody use:dndzone={dndOptions} {onconsider} {onfinalize}>
		{@render children?.()}
	</tbody>
{:else}
	<tbody>
		{@render children?.()}
	</tbody>
{/if}
