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

	let { activeTab = $bindable(TAURI ? 'general' : '') }: Props = $props();

	let subTab = $state('');
	let bread_crumb;

	if (TAURI) {
		activeTab = 'general';
	}

	let menuItems = (
		TAURI
			? [
					{
						title: 'General',
						tab: 'general',
						img: 'img/settings.svg',
						// onClick: () => setItem('general'),
						svelte_component: SettingsGeneral,
					},
				]
			: []
	).concat([
		{
			title: 'Appearance',
			tab: 'appearance',
			img: 'img/appearance.svg',
			// onClick: () => setItem('appearance'),
			svelte_component: SettingsAppearance,
			subTabs: {
				title: 'Theme',
				tab: 'theme',
				img: 'img/themes.svg',
				// onClick: () => setItem('themes'),
				svelte_component: SettingsThemes,
			},
		},
		{
			title: 'Notifications',
			tab: 'notifications',
			img: 'img/notification.svg',
			// onClick: () => setItem('notifications'),
			svelte_component: SettingsNotifications,
		},
	]);

	function setItem(item) {
		activeTab = item;
		bread_crumb.setBreadcrumb(item);
	}

	onMount(() => {
		setContext('bread_crumb', bread_crumb);
	});
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
