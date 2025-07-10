<script lang="ts">
	import { module } from '../../scripts/module.ts';
	import { wallets, networks, type IWallet, type INetwork, settingsWindow } from '../../scripts/wallet.ts';
	import { attachParents } from '@/core/scripts/base_settings.ts';
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import SettingsGeneral from './SettingsGeneral.svelte';
	import SettingsNetworks from './SettingsNetworks.svelte';
	import SettingsWallets from './SettingsWallets.svelte';
	import SettingsAddressbook from './SettingsAddressbook.svelte';
	import SettingsWalletsWallet from './SettingsWalletsWallet.svelte';
	import SettingsWalletsAdd from './SettingsWalletsAdd.svelte';
	import SettingsNetworksRPCServers from './SettingsNetworksRPCServers.svelte';
	import SettingsNetworksAddEdit from './SettingsNetworksAddEdit.svelte';
	let elBaseSettings: BaseSettings;
	let walletsItems = $derived.by(() => {
		return $wallets.map((wallet: IWallet) => ({
			title: wallet.name,
			name: 'wallets-' + wallet.address,
			body: SettingsWalletsWallet,
			props: {
				params: {
					wallet,
				},
			},
		}));
	});

	let networksItems = $derived.by(() => {
		const networkEditItems = $networks.map((network: INetwork) => ({
			title: 'Edit network',
			name: 'networks-edit-' + network.guid,
			body: SettingsNetworksAddEdit,
			props: { network },
		}));

		const networkRPCItems = $networks.map((network: INetwork) => ({
			title: 'RPC servers',
			name: 'networks-rpc-' + network.guid,
			body: SettingsNetworksRPCServers,
			props: { network },
		}));

		return [...networkEditItems, ...networkRPCItems];
	});

	let settingsObject = $derived(
		attachParents({
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
					items: [
						...networksItems,
						{
							title: 'Add a new network',
							name: 'networks-add',
							body: SettingsNetworksAddEdit,
						},
					],
				},
				{
					title: 'Wallets',
					name: 'wallets',
					body: SettingsWallets,
					items: [
						...walletsItems,
						{
							title: 'Add a new wallet',
							name: 'wallets-add',
							body: SettingsWalletsAdd,
						},
					],
				},
				{
					title: 'Address book',
					name: 'addressbook',
					body: SettingsAddressbook,
				},
			],
		})
	);

	$effect(() => {
		settingsWindow.set(elBaseSettings);
	});
</script>

<BaseSettings {settingsObject} bind:this={elBaseSettings} />
