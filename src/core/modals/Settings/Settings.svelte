<script lang="ts">
	import SettingsAppearance from '../../components/Settings/SettingsAppearance.svelte';
	import SettingsNotifications from '../../components/Settings/SettingsNotifications.svelte';
	import SettingsGeneral from '../../components/Settings/SettingsGeneral.svelte';
	import BaseSettings from './BaseSettings.svelte';

	type Props = {
		activeTab?: any;
		onOptionalIconClick?: any;
		optionalIconImage?: any;
	};

	let { activeTab = $bindable(), onOptionalIconClick = $bindable(), optionalIconImage = $bindable() }: Props = $props();

	let menuItems = [
		{
			id: 'general',
			title: 'General',
			img: 'img/settings.svg',
			component: SettingsGeneral,
			tauri: true,
		},

		{
			id: 'appearance',
			title: 'Appearance',
			img: 'img/appearance.svg',
			tauri: false,
			component: SettingsAppearance,
		},

		{
			id: 'notifications',
			title: 'Notifications',
			img: 'img/notification.svg',
			component: SettingsNotifications,
		},
	];
</script>

<style>
</style>

<BaseSettings {menuItems} title="Settings" {activeTab} header={false} footer={false} children={false} bind:onOptionalIconClick bind:optionalIconImage></BaseSettings>
