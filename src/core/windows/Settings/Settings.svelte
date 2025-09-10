<script lang="ts">
	import BaseSettingsWindow from '@/core/components/Settings/BaseSettingsWindow.svelte';
	import type { ISettingsObject, IBaseSettingsInstance } from '@/core/types/settings.ts';
	import SettingsGeneral from '@/core/windows/Settings/SettingsGeneral.svelte';
	import SettingsModules from '@/core/windows/Settings/SettingsModules.svelte';
	import SettingsAppearance from '@/core/windows/Settings/SettingsAppearance.svelte';
	import SettingsNotifications from '@/core/windows/Settings/SettingsNotifications.svelte';
	import SettingsAppearanceTheme from './SettingsAppearanceTheme.svelte';
	let elBaseSettings: IBaseSettingsInstance;
	let settingsObject: ISettingsObject = {
		title: 'Settings',
		name: 'settings',
		menu: [
			{
				img: 'img/general.svg',
				title: 'General',
				name: 'general',
			},
			{
				img: 'img/module.svg',
				title: 'Modules',
				name: 'modules',
			},
			{
				img: 'img/show.svg',
				title: 'Appearance',
				name: 'appearance',
			},
			{
				img: 'img/notification.svg',
				title: 'Notifications',
				name: 'notifications',
			},
		],
		items: [
			{
				title: 'General',
				name: 'general',
				body: SettingsGeneral,
			},
			{
				title: 'Modules',
				name: 'modules',
				body: SettingsModules,
			},
			{
				title: 'Appearance',
				name: 'appearance',
				body: SettingsAppearance,
				items: [
					{
						title: 'Edit theme',
						name: 'edit-theme',
						body: SettingsAppearanceTheme,
					},
				],
			},
			{
				title: 'Notifications',
				name: 'notifications',
				body: SettingsNotifications,
			},
		],
	};

	export function open() {
		elBaseSettings?.open();
	}

	export function close() {
		elBaseSettings?.close();
	}
</script>

<BaseSettingsWindow testId="global-settings" {settingsObject} bind:this={elBaseSettings} />
