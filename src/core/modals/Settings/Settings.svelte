<script lang="ts">
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import SettingsGeneral from '@/core/modals/Settings/SettingsGeneral.svelte';
	import SettingsModules from '@/core/modals/Settings/SettingsModules.svelte';
	import SettingsAppearance from '@/core/modals/Settings/SettingsAppearance.svelte';
	import SettingsNotifications from '@/core/modals/Settings/SettingsNotifications.svelte';
	import SettingsAppearanceTheme from './SettingsAppearanceTheme.svelte';
	interface Props {
		testId?: string;
		show?: boolean;
	}
	let { testId = '', show = $bindable(false) }: Props = $props();
	let settingsObject = {
		title: 'Settings',
		name: 'settings',
		menu: [
			{
				img: 'img/general.svg',
				title: 'General',
				name: 'general',
			},
			{
				img: 'img/settings.svg',
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
</script>

<BaseSettings {testId} {settingsObject} bind:show />
