<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { registerDragHandle, unregisterDragHandle } from '@/core/actions/tableDrag.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		size?: string;
		ariaLabel?: string;
		class?: string;
		colorVariable?: string;
	}
	const { size = '20px', ariaLabel = 'Drag to reorder', class: className = '', colorVariable = '--primary-foreground' }: Props = $props();
	let handleElement: HTMLElement;

	onMount(() => {
		if (handleElement) registerDragHandle(handleElement);
	});

	onDestroy(() => {
		if (handleElement) unregisterDragHandle(handleElement);
	});
</script>

<style>
	.drag-handle {
		cursor: grab;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 5px;
		user-select: none;
		transition: opacity 0.2s ease;
	}

	.drag-handle:active {
		cursor: grabbing;
	}
</style>

<div bind:this={handleElement} class="drag-handle {className}" style="width: {size}; height: {size};" role="button" tabindex="0" aria-label={ariaLabel}>
	<Icon img="img/drag.svg" alt="Drag handle" {colorVariable} {size} padding="0px" />
</div>
