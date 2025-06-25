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
	let barEl: HTMLDivElement | undefined;

	async function applyEqualSize() {
		if (!equalize || !barEl) return;
		await tick();
		let max = 0;
		barEl.querySelectorAll('.button').forEach(b => {
			max = Math.max(max, (b as HTMLElement).getBoundingClientRect().width);
		});

		const target = Math.ceil(max);
		barEl.querySelectorAll('.button').forEach(b => {
			(b as HTMLElement).style.width = `${target}px`;
		});
	}

	onMount(() => {
		if (equalize) applyEqualSize();
	});
	$effect(() => {
		if (equalize) applyEqualSize();
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

<div class="button-bar" bind:this={barEl} class:expand class:space class:align-left={align === 'left'} class:align-center={align === 'center'} class:align-right={align === 'right'}>
	{@render children?.()}
</div>
