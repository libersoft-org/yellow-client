<script lang="ts">
	import { computePosition, shift, offset } from '@floating-ui/dom';
	import Portal from '@/core/components/Portal/Portal.svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		targetRef: HTMLElement;
		children?: Snippet;
	}
	let { targetRef, children }: Props = $props();
	let floatingRef: HTMLElement;
	const setupFloatingUI = () => {
		computePosition(targetRef, floatingRef, {
			placement: 'top',
			middleware: [
				// autoPlacement({
				//  alignment: 'start',
				//  allowedPlacements: ['top-start', 'top-end'],
				// }),
				shift(),
				offset(8),
			],
		}).then(({ x, y }) => {
			Object.assign(floatingRef.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
		});
	};

	$effect(() => {
		if (targetRef) {
			setupFloatingUI();
		}
	});
</script>

<style>
	.tooltip {
		position: absolute;
		width: max-content;
		top: 0;
		left: 0;
		background-color: var(--default-foreground);
		border-radius: 6px;
		color: var(--default-background);
		padding: 6px;
		font-size: 12px;
		line-height: 16px;
	}
</style>

<Portal>
	<div class="tooltip" bind:this={floatingRef}>
		{@render children?.()}
	</div>
</Portal>
