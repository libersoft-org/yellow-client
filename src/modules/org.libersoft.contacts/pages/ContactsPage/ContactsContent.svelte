<script>
	//import { onMount } from 'svelte';
	import { hideSidebarMobile, setModule } from '@/core/core.ts';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Content from '@/core/components/Content/Content.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	//import Dialog from '@/core/components/Dialog/Dialog.svelte';
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import SettingsGeneral from '@/core/modals/Settings/SettingsGeneral.svelte';
	import SettingsAppearance from '@/core/modals/Settings/SettingsAppearance.svelte';
	import SettingsNotifications from '@/core/modals/Settings/SettingsNotifications.svelte';
	import SettingsModules from '@/core/modals/Settings/SettingsModules.svelte';

	// TEST: Dialog
	/*
	let elDialog;
	let dialogData = {
		title: 'Dialog title',
		body: 'Dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content, dialog content.',
		icon: 'img/photo.svg',
		buttons: [
			{ text: 'Abort', onClick: clickButton, expand: true },
			{ text: 'Retry', onClick: clickButton, expand: true },
			{ text: 'Close', onClick: () => elDialog.close(), expand: true },
		],
	};

	onMount(() => {
		elDialog.open();
	});
 */

	// TEST: BaseSettings
	let settingsObject = {
		title: 'Example Settings',
		name: 'example',
		menu: [
			{
				img: 'img/settings.svg',
				title: 'General',
				name: 'general',
			},
			{
				img: 'img/settings.svg',
				title: 'Modules',
				name: 'modules',
			},
			{
				img: 'img/appearance.svg',
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
				menu: [
					{
						img: 'img/settings.svg',
						title: 'Test button',
						onClick: () => alert('Test button clicked'),
					},
				],
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
			},
			{
				title: 'Notifications',
				name: 'notifications',
				body: SettingsNotifications,
			},
		],
	};

	function clickButton() {
		console.log('Clicked on button');
	}

	function back() {
		hideSidebarMobile.set(false);
	}

	function close() {
		setModule(null);
	}
</script>

<Content>
	<Bar>
		{#snippet left()}
			<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
			<BarTitle text="Contact list" />
		{/snippet}
		{#snippet right()}
			<Icon img="img/close.svg" onClick={close} colorVariable="--secondary-foreground" visibleOnMobile={false} />
		{/snippet}
	</Bar>
	<Page>
		<div>Contact list - content page - not yet implemented</div>
	</Page>
</Content>

<!--<Dialog data={dialogData} width="400px" bind:this={elDialog} />-->
<BaseSettings {settingsObject} />
