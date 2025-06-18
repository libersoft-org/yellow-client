<script>
	import { get } from 'svelte/store';
	import { active_account } from '@/core/core.ts';
	import { module_decls, selected_module_id } from '@/core/stores.ts';
	import resize from '@/core/actions/resizeObserver.ts';
	import { order } from '@/core/utils/utils.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import ModuleBarItem from '@/core/components/ModuleBar/ModuleBarItem.svelte';
	export let onSelectModule;
	export let onCloseModule;
	let itemsEl;
	let module_data;
	let lastModuleSelected = false;
	let expanded = false;
	let module_decls_ordered = [];
	let expandEnabled = false;

	$: module_decls_ordered = order($module_decls);
	$: module_data = $active_account?.module_data || {};
	//$: console.log('module-bar module_data:', module_data);
	$: module_data_ordered = order(module_data);
	//$: console.log('module-bar module_data_ordered:', module_data_ordered);
	$: selectLastModule(module_data);

	function selectLastModule(module_data) {
		console.log('selectLastModule: lastModuleSelected: ', module_data);
		if (!lastModuleSelected && module_data_ordered && module_data_ordered.length > 0) {
			//console.log('selectLastModule: lastModuleSelected: ', lastModuleSelected);
			lastModuleSelected = true;
			let acc = get(active_account);
			//console.log('selectLastModule: acc: ', acc);
			let id = acc.settings?.last_module_id;
			//console.log('selectLastModule: ', module_data);
			//console.log('selectLastModule: id: ', id);
			if (module_data[id]) onSelectModule(id);
		}
	}

	function clickSetModule(id) {
		console.log('clickSetModule: ' + id);
		if ($selected_module_id === id) onCloseModule();
		else onSelectModule(id);
		lastModuleSelected = true;
	}

	function clickExpand() {
		const el = itemsEl;
		const full = el.scrollHeight + 'px';
		if (expanded) {
			el.style.maxHeight = full;
			void el.offsetHeight;
			el.style.maxHeight = '50px';
		} else {
			el.style.maxHeight = '50px';
			void el.offsetHeight;
			el.style.maxHeight = full;
			const tidy = () => {
				el.style.maxHeight = '';
				el.removeEventListener('transitionend', tidy);
			};
			el.addEventListener('transitionend', tidy);
		}
		expanded = !expanded;
	}

	function onResize(entry) {
		const { target, contentRect } = entry;
		const { width, height } = contentRect;
		const children = target.children;
		const childrenTotalWidth = Array.from(children).reduce((total, child) => {
			return total + child.getBoundingClientRect().width;
		}, 0);
		expandEnabled = childrenTotalWidth > width;
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

	.dropdown {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		height: 100%;
		width: max-content;
		cursor: default;
	}

	.dropdown :global(.icon) {
		position: relative;
		top: 14px;
		transform: rotate(0deg);
		transition: transform 0.3s ease;
	}

	.module-bar.expanded .dropdown :global(.icon) {
		transform: rotate(180deg);
	}

	.module-bar:not(.expand-enabled) .dropdown {
		opacity: 0.3;
		cursor: default;
		pointer-events: none;
	}
</style>

<div class="module-bar" class:expand-enabled={expandEnabled} class:expanded>
	<div class="items" use:resize={onResize} bind:this={itemsEl}>
		{#each module_decls_ordered as decl (decl.id)}
			<ModuleBarItem online={$active_account?.module_data[decl.id]?.online} selected={$selected_module_id === decl.id} {decl} {clickSetModule} />
		{/each}
	</div>
	<Clickable disabled={!expandEnabled}>
		<div class="dropdown">
			<Icon img={'img/down.svg'} alt={expanded ? '▲' : '▼'} colorVariable="--secondary-foreground" size="20px" padding="10" onClick={clickExpand} />
		</div>
	</Clickable>
</div>
