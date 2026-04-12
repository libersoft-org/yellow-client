<script lang="ts">
	import { get } from 'svelte/store';
	import { active_account } from '@/core/scripts/core.ts';
	import { module_decls, selected_module_id } from '@/core/scripts/stores.ts';
	import resize from '@/core/actions/resizeObserver.ts';
	import { order } from '@/core/scripts/utils/utils.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import ModuleBarItem from '@/core/components/ModuleBar/ModuleBarItem.svelte';

	interface Props {
		onSelectModule: (id: string) => void;
		onCloseModule: () => void;
	}

	let { onSelectModule, onCloseModule }: Props = $props();
	let itemsEl: HTMLElement;
	let lastModuleSelected = false;
	let expanded = $state(false);
	let expandEnabled = $state(false);
	let pendingTidy: (() => void) | null = null;

	let module_decls_ordered = $derived(order($module_decls));
	let module_data = $derived($active_account?.module_data || {});
	let _selectLastModule = $derived.by((): boolean => {
		// read module_data to track reactivity
		void module_data;
		if (!lastModuleSelected) {
			let acc = get(active_account);
			let id = acc?.settings?.['last_module_id'];
			if (id) {
				lastModuleSelected = true;
				onSelectModule(id);
			}
		}
		return lastModuleSelected;
	});

	function clickSetModule(id: string): void {
		//console.log('clickSetModule: ' + id);
		if ($selected_module_id === id) onCloseModule();
		else onSelectModule(id);
		lastModuleSelected = true;
	}

	function clickExpand(): void {
		const el = itemsEl;
		if (pendingTidy) {
			el.removeEventListener('transitionend', pendingTidy);
			pendingTidy = null;
		}
		const full = el.scrollHeight + 'px';
		if (expanded) {
			el.style.maxHeight = full;
			void el.offsetHeight;
			el.style.maxHeight = '50px';
			const tidy = (): void => {
				pendingTidy = null;
				scrollToSelected();
			};
			pendingTidy = tidy;
			el.addEventListener('transitionend', tidy, { once: true });
		} else {
			el.style.maxHeight = '50px';
			void el.offsetHeight;
			el.style.maxHeight = full;
			const tidy = (): void => {
				pendingTidy = null;
				el.style.maxHeight = '';
			};
			pendingTidy = tidy;
			el.addEventListener('transitionend', tidy, { once: true });
		}
		expanded = !expanded;
	}

	function scrollToSelected(): void {
		if (!$selected_module_id || !itemsEl) return;
		const selectedElement = itemsEl.querySelector(`[data-module-id="${$selected_module_id}"]`);
		if (selectedElement) selectedElement.scrollIntoView({ block: 'center' });
	}

	function onResize(entry: ResizeObserverEntry): void {
		const { target, contentRect } = entry;
		const { width } = contentRect;
		const children = target.children;
		const childrenTotalWidth = Array.from(children).reduce((total: number, child: Element) => {
			return total + child.getBoundingClientRect().width;
		}, 0);
		expandEnabled = childrenTotalWidth > width;
		scrollToSelected();
	}
</script>

<style>
	.module-bar {
		display: flex;
		border-bottom: 1px solid var(--secondary-softer-background);
		background-color: var(--secondary-background);
		display: flex;
		justify-content: center;
		height: fit-content;
	}

	.items {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		max-height: 50px;
		flex: 1;
		row-gap: 10px;
		flex-wrap: wrap;
		padding: 10px;
		margin: 0;
		overflow: hidden;
		will-change: height;
		transition: max-height 0.25s linear;
	}

	.module-bar.expanded .items {
		max-height: none;
	}

	.dropdown-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 70px;
	}

	.dropdown {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		height: 100%;
	}

	.dropdown :global(.icon) {
		position: relative;
		transform: rotate(0deg);
		transition: transform 0.3s ease;
	}

	.module-bar.expanded .dropdown :global(.icon) {
		transform: rotate(180deg);
	}

	.module-bar:not(.expand-enabled) .dropdown-wrapper {
		display: none;
	}
</style>

<div class="module-bar" class:expand-enabled={expandEnabled} class:expanded data-last-module-selected={_selectLastModule || undefined}>
	<div class="items" use:resize={onResize} bind:this={itemsEl}>
		{#each module_decls_ordered as decl (decl.id)}
			<ModuleBarItem online={$active_account?.module_data[decl.id]?.online} selected={$selected_module_id === decl.id} {decl} {clickSetModule} />
		{/each}
	</div>
	<div class="dropdown-wrapper">
		<Clickable enabled={expandEnabled} onClick={clickExpand}>
			<div class="dropdown">
				<Icon img={'img/down.svg'} alt={expanded ? '▲' : '▼'} colorVariable="--secondary-foreground" size="20px" padding="10" />
			</div>
		</Clickable>
	</div>
</div>
