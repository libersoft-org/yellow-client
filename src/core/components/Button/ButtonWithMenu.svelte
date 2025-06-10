<script lang="ts">
	/* TODO: refactor with Button.svelte ? */
	import { autoPlacement, autoUpdate, computePosition, offset, shift } from '@floating-ui/dom';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Portal from '@/core/components/Portal/Portal.svelte';
	interface Props {
		sideButtonSlot: any;
		mainButtonSlot: any;
		tooltipSlot: any;
	}
	let { sideButtonSlot, mainButtonSlot, tooltipSlot }: Props = $props();
	let buttonRef: HTMLElement;
	let floatingRef = $state<HTMLElement>();
	let show = $state(false);
	let autoPlacementCleanup: ReturnType<typeof handleFloatingUI>;

	const onClick = () => {
		console.log('click');
		show = !show;
	};

	const handleOutsideClick = (e: MouseEvent) => {
		if (floatingRef && !floatingRef.contains(e.target as Node) && !buttonRef.contains(e.target as Node)) {
			show = false;
			document.removeEventListener('click', handleOutsideClick);
		}
	};

	const handleFloatingUI = () => {
		if (!buttonRef || !floatingRef) {
			return;
		}
		const autoUpdateCleanUp = autoUpdate(buttonRef, floatingRef, () => {
			// @ts-ignore
			computePosition(buttonRef, floatingRef, {
				middleware: [
					autoPlacement({
						alignment: 'start',
						allowedPlacements: ['top-start', 'top-end'],
						padding: 4,
					}),
					shift(),
					offset(8),
				],
			}).then(({ x, y }) => {
				// @ts-ignore
				Object.assign(floatingRef.style, {
					left: `${x}px`,
					top: `${y}px`,
				});
			});
		});
		document.addEventListener('click', handleOutsideClick);
		return () => {
			autoUpdateCleanUp && autoUpdateCleanUp();
		};
	};

	$effect(() => {
		if (show) autoPlacementCleanup = handleFloatingUI();
		else autoPlacementCleanup && autoPlacementCleanup();
	});
</script>

<style>
	.button-with-menu {
		display: flex;
	}

	.side-button {
		display: flex;
		align-self: stretch;
		background-color: var(--primary-softer-background);
		border-top-left-radius: 8px;
		border-bottom-left-radius: 8px;
		border: 1px solid var(--primary-background);
	}

	.main-button :global(.button) {
		display: flex;
		border-top-left-radius: 0px !important;
		border-bottom-left-radius: 0px !important;
		border-left: 0 !important;
	}

	.tooltip {
		display: flex;
		align-items: center;
		background: var(--primary-softer-background);
		padding: 8px;
		border-radius: 20px;
		box-shadow: var(--shadow);
		max-width: calc(100vh - 20px);
		z-index: 100000;
	}
</style>

<div class="button-with-menu">
	<Clickable {onClick}>
		<div class="side-button" bind:this={buttonRef}>
			{@render sideButtonSlot?.()}
		</div>
	</Clickable>
	<div class="main-button">
		{@render mainButtonSlot?.()}
	</div>
</div>

{#if show}
	<Portal>
		<div bind:this={floatingRef} class="tooltip floating" style:display={show ? 'block' : 'none'}>
			{@render tooltipSlot?.()}
		</div>
	</Portal>
{/if}
