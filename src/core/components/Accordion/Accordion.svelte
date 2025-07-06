<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { isMobile } from '@/core/scripts/stores.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props {
		items: Array<{ name: string }>;
		content: Snippet<[any]> | null;
		header?: Snippet<[any]> | null;
		expandAllOnDesktop?: boolean;
		mode?: 'single' | 'multiple';
		testId?: string;
	}
	let { items, content, header, expandAllOnDesktop = false, mode = 'single', testId = '' }: Props = $props();
	let activeIndices: number[] = $state<number[]>([]);
	const isSingleMode: boolean = mode === 'single';

	export async function handleClick(index: number, newState: boolean | undefined = undefined) {
		console.debug('Accordion clicked', index, newState);
		let isOpen: boolean = activeIndices.includes(index);
		const el: HTMLElement = document.querySelector(`.content[data-index="${index}"]`) as HTMLElement;
		if (!el) return;
		if (newState !== undefined) {
			if (newState) isOpen = false;
			else isOpen = true;
			return;
		}
		// CLOSE
		if (isOpen) {
			el.style.height = `${el.scrollHeight}px`;
			el.offsetHeight;
			el.style.height = '0px';
			activeIndices = activeIndices.filter(i => i !== index);
			return;
		}
		// OPEN
		// Remove others if needed
		if (($isMobile || !expandAllOnDesktop) && isSingleMode) {
			activeIndices.forEach(i => {
				const other = document.querySelector(`.content[data-index="${i}"]`) as HTMLElement;
				if (other) {
					other.style.height = `${other.scrollHeight}px`;
					other.offsetHeight;
					other.style.height = '0px';
				}
			});
			activeIndices = [];
		} else if (typeof mode === 'number' && activeIndices.length >= mode) {
			const toClose = activeIndices[0];
			const other = document.querySelector(`.content[data-index="${toClose}"]`) as HTMLElement;
			if (other) {
				other.style.height = `${other.scrollHeight}px`;
				other.offsetHeight;
				other.style.height = '0px';
			}
			activeIndices = activeIndices.slice(1); // Remove first
		}
		el.style.height = '0px';
		el.offsetHeight;
		el.style.height = `${el.scrollHeight}px`;
		activeIndices = [...activeIndices, index];
		setTimeout(() => {
			if (activeIndices.includes(index)) {
				el.style.height = 'auto';
			}
		}, 300);
	}

	$effect(() => {
		function expandAll() {
			activeIndices = items.map((_, i) => i);
			tick().then(() => {
				activeIndices.forEach(index => {
					const el = document.querySelector(`.content[data-index="${index}"]`) as HTMLElement;
					if (el) {
						el.style.height = `${el.scrollHeight}px`;
						setTimeout(() => {
							if (activeIndices.includes(index)) {
								el.style.height = 'auto';
							}
						}, 300);
					}
				});
			});
		}

		function collapseAll() {
			activeIndices = [];
			items.forEach((_, index) => {
				const el = document.querySelector(`.content[data-index="${index}"]`) as HTMLElement;
				if (el) {
					el.style.height = `${el.scrollHeight}px`;
					el.offsetHeight;
					el.style.height = '0px';
				}
			});
		}

		if (expandAllOnDesktop) {
			if (!$isMobile) {
				expandAll();
			} else {
				collapseAll();
			}
		}
	});

	$effect(() => {
		function collapseAll() {
			activeIndices = [];
			items.forEach((_, index) => {
				const el = document.querySelector(`.content[data-index="${index}"]`) as HTMLElement;
				if (el) {
					el.style.height = `${el.scrollHeight}px`;
					el.offsetHeight;
					el.style.height = '0px';
				}
			});
		}

		if ($isMobile) {
			collapseAll();
		}
	});
</script>

<style>
	.accordion {
		border: 1px solid var(--primary-harder-background);
		border-radius: 8px;
		overflow: hidden;
		color: var(--primary-foreground);
	}

	.accordion:empty {
		display: none;
	}

	.accordion .item {
		border-bottom: 1px solid var(--primary-harder-background);
	}

	.accordion .item :global(.header .icon) {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: rotate(0deg) translateY(-50%);
	}

	.accordion .item :global(.header img) {
		transition: transform 0.3s ease;
	}

	.accordion .item:last-child {
		border-bottom: none;
	}

	.accordion .item .header {
		display: flex;
		flex-wrap: wrap-reverse;
		gap: 10px;
		align-items: center;
		padding: 10px;
		filter: brightness(1);
		transition: filter 0.3s ease;
		padding-right: 50px;
		min-height: 40px;
		background-color: var(--primary-background);
		cursor: pointer;
		box-sizing: border-box;
	}

	.accordion .item .header {
		width: 100%;
	}

	.accordion .item .header .title {
		flex-grow: 1;
		font-weight: bold;
	}

	.accordion .item .content {
		height: 0;
		overflow: hidden;
		border-top: 1px solid var(--primary-harder-background);
		transition: height 0.3s ease;
	}

	.accordion .item {
		display: grid;
	}

	.accordion .item.is-expanded :global(.header img) {
		transform: rotate(180deg);
	}
</style>

<div class="accordion">
	{#each items as item, index}
		{@const icon_action = activeIndices.includes(index) ? 'collapse' : 'expand'}
		<div class="item {activeIndices.includes(index) ? 'is-expanded' : ''}">
			<Clickable onClick={() => handleClick(index)} data-testid={`${testId}-accordion-${icon_action}-${index}`}>
				<div class="header">
					<div class="title">{item.name}</div>
					{@render header?.(item)}
					<Icon img="img/down.svg" alt="▼" colorVariable="--primary-foreground" size="12px" />
				</div>
			</Clickable>
			<div class="content {activeIndices.includes(index) ? 'is-expanded' : ''}" data-index={index}>
				{@render content?.(item)}
			</div>
		</div>
	{/each}
</div>
