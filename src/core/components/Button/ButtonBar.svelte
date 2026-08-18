<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		expand?: boolean;
		align?: 'left' | 'center' | 'right';
		equalize?: boolean;
		space?: boolean;
	}
	let { children, expand = false, align = 'left', equalize = false, space = false }: Props = $props();
	let elBar: HTMLDivElement | undefined;

	async function applyEqualSize(): Promise<void> {
		await tick();
		if (!equalize || !elBar) return;
		const buttons = [...elBar.querySelectorAll('.button')] as HTMLElement[];
		let max = 0;
		buttons.forEach(b => {
			max = Math.max(max, b.getBoundingClientRect().width);
		});

		const target = Math.ceil(max);
		/* Every button measures zero when the bar mounts inside an ancestor that has no box yet.
		 * Writing that zero back pinned each button to nothing but its own padding - a 22px stub with
		 * the icon and label spilling out over the button beside it - and since this only ever ran once,
		 * nothing measured again to undo it. Leave the buttons at their natural width instead and let
		 * the observer below size them once the bar actually has one. */
		if (target === 0) return;
		/* Re-runs land here with the widths already applied, and rewriting them would resize the bar and
		 * wake the observer for nothing. */
		if (buttons.every(b => b.style.width === `${target}px`)) return;
		buttons.forEach(b => {
			b.style.width = `${target}px`;
		});
	}

	onMount(() => {
		if (!equalize || !elBar) return;
		void applyEqualSize();
		/* Fires when the bar first gains a size, which is what a bar that mounted without layout is
		 * waiting for, and again whenever it is resized. */
		const observer = new ResizeObserver(() => void applyEqualSize());
		observer.observe(elBar);
		return () => observer.disconnect();
	});
</script>

<style>
	.button-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		width: 100%;
	}

	.button-bar.expand :global(.clickable) {
		flex: 1;
	}

	.button-bar.align-left {
		justify-content: baseline;
	}

	.button-bar.align-center {
		justify-content: center;
	}

	.button-bar.align-right {
		justify-content: end;
	}

	.button-bar.space {
		justify-content: space-between;
	}
</style>

<div class="button-bar" bind:this={elBar} class:expand class:space class:align-left={align === 'left'} class:align-center={align === 'center'} class:align-right={align === 'right'}>
	{@render children?.()}
</div>
