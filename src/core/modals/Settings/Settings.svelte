<script lang="ts">
	import SettingsAppearance from '../../components/Settings/SettingsAppearance.svelte';
	import SettingsNotifications from '../../components/Settings/SettingsNotifications.svelte';
	import SettingsGeneral from '../../components/Settings/SettingsGeneral.svelte';
	import SettingsThemes from '../../components/Settings/SettingsThemes.svelte';
	import BaseSettings from './BaseSettings.svelte';
	type Props = {
		activeTab?: any;
		onOptionalIconClick?: any;
		optionalIconImage?: any;
	};

	// let activeTab = $state('');

	let { activeTab = $bindable(), onOptionalIconClick = $bindable(), optionalIconImage = $bindable() }: Props = $props();

	let menuItems = [
		{
			title: 'General',
			tab: 'general',
			img: 'img/settings.svg',
			// onClick: () => setItem('general'),
			component: SettingsGeneral,
			tauri: true,
		},

		{
			title: 'Appearance',
			tab: 'appearance',
			img: 'img/appearance.svg',
			tauri: false,
			// onClick: () => setItem('appearance'),
			component: SettingsAppearance,

			// subTabs: [{
			// 	title: 'Theme Manager',
			// 	tab: 'theme',
			// 	// img: 'img/themes.svg',
			// 	// onClick: () => setItem('themes'),
			// 	component: SettingsThemes,
			// }],
		},

		{
			title: 'Notifications',
			tab: 'notifications',
			img: 'img/notification.svg',
			// onClick: () => setItem('notifications'),
			component: SettingsNotifications,
		},

		// {
		// 	title: 'Test Sub Menu',
		// 	tab: 'test',
		// 	img: 'img/notification.svg',
		// 	// onClick: () => setItem('notifications'),
		// 	menuItems:[
		//       {
		//         title: 'Test Sub Menu 2',
		//         tab: 'test2',
		//         img: 'img/notification.svg',
		//         // onClick: () => setItem('notifications'),
		//         menuItems:[
		//           		{
		//                 title: 'Notifications',
		//                 tab: 'notifications',
		//                 img: 'img/notification.svg',
		//                 // onClick: () => setItem('notifications'),
		//                 component: SettingsNotifications,
		//               },
		//         ]
		//       },
		//       {
		//         title: 'Test Sub Menu 3',
		//         tab: 'test 3',
		//         img: 'img/notification.svg',
		//         // onClick: () => setItem('notifications'),
		//         menuItems:[
		//           		{
		//                 title: 'Notifications',
		//                 tab: 'notifications',
		//                 img: 'img/notification.svg',
		//                 // onClick: () => setItem('notifications'),
		//                 component: SettingsNotifications,
		//               },
		//         ]
		//       }
		//     ]

		// }
	];
</script>

<style>
</style>

<BaseSettings {menuItems} title="Settings" {activeTab} header={false} footer={false} children={false} bind:onOptionalIconClick bind:optionalIconImage></BaseSettings>
