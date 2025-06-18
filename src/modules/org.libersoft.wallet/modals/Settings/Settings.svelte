<script lang="ts">
	import { module } from '../../module.js';
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import SettingsGeneral from './SettingsGeneral.svelte';
	import SettingsNetworks from './SettingsNetworks.svelte';
	import SettingsWallets from './SettingsWallets.svelte';
	import SettingsAddressbook from './SettingsAddressbook.svelte';
	interface Props {
		show?: boolean;
	}
	let { show = $bindable(false) }: Props = $props();
	let settingsObject = {
		title: 'Wallet settings',
		name: 'settings',
		menu: [
			{
				img: 'img/general.svg',
				title: 'General',
				name: 'general',
			},
			{
				img: 'modules/' + module.identifier + '/img/network.svg',
				title: 'Networks',
				name: 'networks',
			},
			{
				img: 'modules/' + module.identifier + '/img/wallet.svg',
				title: 'Wallets',
				name: 'wallets',
			},
			{
				img: 'modules/' + module.identifier + '/img/addressbook.svg',
				title: 'Address book',
				name: 'addressbook',
			},
		],
		items: [
			{
				title: 'General',
				name: 'general',
				body: SettingsGeneral,
			},
			{
				title: 'Networks',
				name: 'networks',
				body: SettingsNetworks,
			},
			{
				title: 'Wallets',
				name: 'wallets',
				body: SettingsWallets,
			},
			{
				title: 'Address book',
				name: 'addressbook',
				body: SettingsAddressbook,
			},
		],
	};
</script>

<BaseSettings {settingsObject} bind:show />
