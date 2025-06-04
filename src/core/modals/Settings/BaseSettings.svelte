<script lang="ts">
	import SettingsItem from '@/core/components/Settings/SettingsItem.svelte';
	import { TAURI } from '@/core/tauri.ts';
	import Breadcrumb from '@/core/components/Breadcrumb/Breadcrumb.svelte';
	import { onMount, setContext, type Snippet } from 'svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';

	type Props = {
		activeTab?: any;
		title: string;
		menuItems: Array<any> | false;
		header: Snippet | false;
		footer: Snippet | false;
		children: any;
		onOptionalIconClick: any;
		optionalIconImage: any;
	};

	let { activeTab = $bindable(), title = 'Settings', menuItems = [], children = false, header = false, footer = false, onOptionalIconClick = $bindable(), optionalIconImage = $bindable() }: Props = $props();

	let bread_crumbs = $state([]);

	function setItem(item) {
		activeTab = item;
		setBreadcrumbs(item);
		checkBackButton();
	}

	function back() {
		bread_crumbs.pop();
		checkBackButton();
		return bread_crumbs[bread_crumbs.length - 1];
	}
	onOptionalIconClick = back;

	function checkBackButton() {
		if (activeTab) {
			optionalIconImage = 'img/back.svg';
		} else {
			optionalIconImage = null;
		}
	}

	function findPosition(bread_crumb) {
		let position = -1;
		bread_crumbs.forEach(function callback(item, index) {
			console.log(item.title);
			if (item.title == bread_crumb.title) {
				position = index;
			}
		});
		return position;
	}

	// has to be called on change with breadcrumb that responds to .title
	export function setBreadcrumbs(bread_crumb) {
		console.log(bread_crumb.title);
		let position = findPosition(bread_crumb);
		console.log(position);
		if (position >= 0) {
			if (position < bread_crumbs.length - 1) {
				bread_crumbs.splice(position + 1, bread_crumbs.length - position);
			}
		} else {
			bread_crumbs.push(bread_crumb);
		}
	}
</script>

<style>
	.settings-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.tab-content {
		&:empty {
			display: none;
		}
	}
</style>

<div class="settings-container">
	<Breadcrumb
		root_crumb={{
			title: title,
			tab: '',
			img: '',
			onClick: () => setItem(false),
		}}
		{setItem}
		bind:activeTab
		bind:bread_crumbs
	/>

	{#if header}
		{@render header()}
	{/if}

	{#if !activeTab && menuItems}
		{#each menuItems as item}
			{#if (TAURI && item.tauri) || !item.tauri}
				<SettingsItem img={item.img} title={item.title} onClick={() => setItem(item)} />
			{/if}
		{/each}
	{/if}

	{#if activeTab && activeTab.menuItems}
		{#each activeTab.menuItems as item}
			{#if (TAURI && item.tauri) || !item.tauri}
				<SettingsItem img={item.img} title={item.title} onClick={() => setItem(item)} />
			{/if}
		{/each}
	{/if}

	{#if activeTab && activeTab.subTabs}
		<ButtonBar>
			{#each activeTab.subTabs as item}
				{#if (TAURI && item.tauri) || !item.tauri}
					<Button img={item.img} text={item.title} onClick={() => setItem(item)} />
				{/if}
			{/each}
		</ButtonBar>
	{/if}

	{#if children}
		{@render children()}
	{/if}

	<div class="tab-content">
		{#if !!activeTab && !!activeTab.component}
			<activeTab.component subTabs={activeTab.subTabs} {setItem} isChild={true} title={activeTab.title} {activeTab} />
		{/if}
	</div>

	{#if footer}
		{@render footer()}
	{/if}
</div>
