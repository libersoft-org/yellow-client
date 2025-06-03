<script lang="ts">
	import SettingsItem from '@/core/components/Settings/SettingsItem.svelte';
	import SettingsAppearance from '../../components/Settings/SettingsAppearance.svelte';
	import SettingsNotifications from '../../components/Settings/SettingsNotifications.svelte';
	import SettingsGeneral from '../../components/Settings/SettingsGeneral.svelte';
	import SettingsThemes from '../../components/Settings/SettingsThemes.svelte';
	import { TAURI } from '@/core/tauri.ts';
	import { fade } from 'svelte/transition';
	import Icon from '../../components/Icon/Icon.svelte';
	import Breadcrumb from '@/core/components/Breadcrumb/Breadcrumb.svelte';
	import { onMount, setContext, type Snippet } from 'svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	// import MenuItem from '@/core/components/Menu/MenuItem.svelte';

	type Props = {
		activeTab?: any;
		title: string;
		menuItems: Array<any> | false;
		// subTabs: Array<any> | false;
		header: Snippet | false;
		footer: Snippet | false;
		children: any;
		onOptionalIconClick: any;
		optionalIconImage: any;
		// setItem: any,
		// isChild: boolean,
	};

	// let activeTab = $state('');

	let {
		activeTab = $bindable(),
		title = 'Settings',
		menuItems = [],
		// subTabs = false,
		children = false,
		header = false,
		footer = false,
		// setItem = false,
		// isChild = false,
		onOptionalIconClick = $bindable(),
		optionalIconImage = $bindable(),
	}: Props = $props();

	let bread_crumb;
	onMount(() => {
		setContext('bread_crumb', bread_crumb);
	});

	function setItem(item) {
		activeTab = item;
		bread_crumb.setBreadcrumb(item);
		checkBackButton();
	}

	function back() {
		activeTab = bread_crumb.back();
		checkBackButton();
	}

	function checkBackButton() {
		if (activeTab) {
			optionalIconImage = 'img/back.svg';
		} else {
			optionalIconImage = null;
		}
	}

	onOptionalIconClick = back;
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
		bind:this={bread_crumb}
		root_crumb={{
			title: title,
			tab: '',
			img: '',
			onClick: () => setItem(false),
		}}
		{setItem}
		bind:activeTab
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
			<activeTab.component subTabs={activeTab.subTabs} {setItem} isChild={true} title={activeTab.title} {activeTab} {bread_crumb} />
		{/if}
	</div>

	{#if footer}
		{@render footer()}
	{/if}
</div>
