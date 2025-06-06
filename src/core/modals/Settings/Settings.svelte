<script lang="ts">
	import { fade } from 'svelte/transition';
	import { TAURI } from '@/core/tauri.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import SettingsItem from '@/core/components/Settings/SettingsItem.svelte';
	import SettingsAppearance from '@/core/modals/Settings/SettingsAppearance.svelte';
	import SettingsNotifications from '@/core/modals/Settings/SettingsNotifications.svelte';
	import SettingsGeneral from '@/core/modals/Settings/SettingsGeneral.svelte';
	interface Props {
		activeTab?: any;
	}
	let { activeTab = $bindable(TAURI ? 'general' : '') }: Props = $props();
	let subTab = $state('');
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
		subTab = ''; // reset nested tab
	}

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

	.breadcrumbs {
		display: flex;
		padding: 8px 10px;
		background: hsl(345, 6%, 13%);
		margin-bottom: 0px;
		border-radius: 10px;

		span,
		button {
			display: flex;
			border: none;
			background: none;
			font-size: 14px;
			font-weight: bold;
			padding: 0;
			transition: color 0.3s ease;
			cursor: default;
			text-transform: capitalize;

			&:hover {
				color: white;
			}

			&:not(:first-child)::before {
				content: '>';
				margin: 0 5px;
				color: white;
			}

			&:last-child {
				color: white;
			}
		}

		button {
			cursor: pointer;
			display: flex;
			gap: 6px;
			color: white;
			filter: contrast(0.5);
			transition: filter 0.3s ease;

			&:hover {
				filter: contrast(1);
			}

			:global(.icon) {
				padding: 0 !important;
			}
		}
	}
</style>

{#snippet breadcrumbs(menuItems)}
	{#if activeTab !== ''}
		<div class="breadcrumbs" in:fade={{ duration: 400 }}>
			<button onclick={() => setItem('')}>
				<Icon img="img/home.svg" alt="Settings" size="16px" />
				Settings
			</button>
			<span>
				{#each menuItems as item}
					{#if item.tab === activeTab}
						<button onclick={() => setSubItem('')}>
							{item.title}
						</button>
					{/if}
				{/each}
			</span>
			{#if subTab}
				<span>{subTab}</span>
			{/if}
		</div>
	{/if}
	{#each menuItems as item}
		{#if activeTab === ''}
			<SettingsItem img={item.img} title={item.title} onClick={() => setItem(item.title.toLowerCase())} />
		{/if}
	{/each}
{/snippet}

<div class="settings-container">
	{@render breadcrumbs(menuItems)}
	<div class="tab-content">
		{#if activeTab === 'general'}
			<SettingsGeneral />
		{:else if activeTab === 'appearance'}
			<SettingsAppearance {setSubItem} {subTab} />
		{:else if activeTab === 'notifications'}
			<SettingsNotifications />
		{/if}
	</div>
</div>
