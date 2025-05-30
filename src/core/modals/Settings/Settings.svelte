<script lang="ts">
	import MenuItem from '../../components/Menu/MenuItem.svelte';
	import SettingsAppearance from '../../components/Settings/SettingsAppearance.svelte';
	import SettingsNotifications from '../../components/Settings/SettingsNotifications.svelte';
	import SettingsGeneral from '../../components/Settings/SettingsGeneral.svelte';
	import { TAURI } from '@/core/tauri.ts';
	import { fade } from 'svelte/transition';
	import Icon from '../../components/Icon/Icon.svelte';
	import Breadcrumb from '@/core/components/Breadcrumb/Breadcrumb.svelte';
	import { setContext } from 'svelte';

	let bread_crumb = $state(null);

	// type Props = {
	// 	activeTab?: any;
	// };

	// let { activeTab = $bindable(TAURI ? 'general' : '') }: Props = $props();
	let activeTab = $state("")
  if(TAURI){
		activeTab ="general";
	}

	let menuItems = (
		TAURI
			? [
					{
						title: 'General',
						tab: 'general',
						img: 'img/settings.svg',
						onClick: () => setItem('general'),
					},
				]
			: []
	).concat([
		{
			title: 'Appearance',
			tab: 'appearance',
			img: 'img/appearance.svg',
			onClick: () => setItem('appearance'),
		},
		{
			title: 'Notifications',
			tab: 'notifications',
			img: 'img/notification.svg',
			onClick: () => setItem('notifications'),
		},
	]);

	function setItem(name) {
		activeTab = name;
	}

	let menuItemProps = {
		bgColor: 'var(--color-default-background)',
		textColor: 'var(--color-default-foreground)',
		hoverColor: 'var(--color-secondary-softer-background)',
		borderTop: '1px solid var(--color-disabled-background)',
		borderBottom: '1px solid var(--color-disabled-background)',
		borderLeft: '1px solid var(--color-disabled-background)',
		borderRight: '1px solid var(--color-disabled-background)',
		borderRadius: '10px',
    colorVariable: "--color-default-foreground"
	}

	onMount(() => {
		setContext("bread_crumb": bread_crumb);
	})

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
	<Breadcrumb bind:this={bread_crumb} root_crumb="Settings" bind:activeTab />

	{#each menuItems as item}
		{#if activeTab === ''}
			<MenuItem img={item.img} title={item.title} colorVariable={menuItemProps.colorVariable} bgColor={menuItemProps.bgColor} textColor={menuItemProps.textColor} hoverColor={menuItemProps.hoverColor} borderTop={menuItemProps.borderTop} borderBottom={menuItemProps.borderBottom} borderLeft={menuItemProps.borderLeft} borderRight={menuItemProps.borderRight} borderRadius={menuItemProps.borderRadius} onClick={() => setItem(item.tab)} />
		{/if}
	{/each}
	<div class="tab-content">
		{#if activeTab === 'general'}
			<SettingsGeneral />
		{:else if activeTab === 'appearance'}
			<SettingsAppearance />
		{:else if activeTab === 'notifications'}
			<SettingsNotifications />
		{/if}
	</div>
</div>
