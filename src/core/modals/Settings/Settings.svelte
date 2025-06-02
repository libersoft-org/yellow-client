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
	import { onMount, setContext } from 'svelte';
	// import MenuItem from '@/core/components/Menu/MenuItem.svelte';

	type Props = {
		activeTab?: any;
	};

	// let activeTab = $state('');

	let { activeTab = $bindable(false) }: Props = $props();

	let subTab = $state('');
	let bread_crumb;

	let menuItems = [
		{
			title: 'General',
			tauri_only: true,
			id: 'general',
			img: 'img/settings.svg',
			// onClick: () => setItem('general'),
			svelte_component: SettingsGeneral,
		},
		{
			title: 'Appearance',
			id: 'appearance',
			img: 'img/appearance.svg',
			// onClick: () => setItem('appearance'),
			svelte_component: SettingsAppearance,
			subTabs: {
				title: 'Theme',
				id: 'theme',
				img: 'img/themes.svg',
				// onClick: () => setItem('themes'),
				svelte_component: SettingsThemes,
			},
		},
		{
			title: 'Notifications',
			id: 'notifications',
			img: 'img/notification.svg',
			// onClick: () => setItem('notifications'),
			svelte_component: SettingsNotifications,
		},
	];

	function itemPath(item) {
		return itemPath2(menuItems, item);
	}

	function itemPath2(items, item) {
		if (!item) return [];
		let path = [];
		for (let i = 0; i < items.length; i++) {
			if (items[i].id === item.id) {
				path.push(items[i]);
				return path;
			}
			if (items[i].subTabs) {
				let subPath = itemPath2(items[i].subTabs, item);
				if (subPath.length > 0) {
					path.push(items[i]);
					path = path.concat(subPath);
					return path;
				}
			}
		}
		return [];
	}

	function setActiveTab(item) {
		activeTab = item;
	}

	function setItem(item) {
		activeTab = item;
		bread_crumb.setPath(itemPath(menuItems, item));
	}

	onMount(() => {
		setContext('bread_crumb', bread_crumb);
	});

	function setSubItem(name) {
		subTab = name;
	}

	/*
	settingsArr = [
		{
			title: 'General',
			name:	'general',
			img: 'img/settings.svg',
			component: SettingsGeneral,
			sub: [
    {
					title: 'Subcomponent of general',
					name: 'subgeneral',
					img:	'img/subsettings.svg',
					component: SettingsSubGeneral,
					sub: [
					 ...
					]
				}
			]
		}
	];

	<svelte:component ... />
	*/
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
		{setActiveTab}
		bind:this={bread_crumb}
		root_crumb={{
			title: 'Settings',
			tab: '',
			img: '',
			onClick: () => setItem(false),
		}}
		{setItem}
		bind:activeTab
	/>

	{#if !activeTab}
		{#each menuItems as item}
			<SettingsItem img={item.img} title={item.title} onClick={() => setItem(item)} />
		{/each}
	{/if}
	<div class="tab-content">
		{#if activeTab}
			<svelte:component this={activeTab.svelte_component} subTabs={activeTab.subTabs} {bread_crumb} {setItem} />
		{/if}
	</div>
</div>
