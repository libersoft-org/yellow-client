<script lang="ts">
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { wallets, networks, type IWallet, type INetwork, settingsWindow } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { attachParents } from '@/core/scripts/base_settings.ts';
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import SettingsGeneral from '@/org.libersoft.wallet/windows/Settings/SettingsGeneral.svelte';
	import SettingsNetworks from '@/org.libersoft.wallet/windows/Settings/SettingsNetworks.svelte';
	import SettingsNetworksTokens from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksTokens.svelte';
	import SettingsWallets from '@/org.libersoft.wallet/windows/Settings/SettingsWallets.svelte';
	import SettingsAddressbook from '@/org.libersoft.wallet/windows/Settings/SettingsAddressbook.svelte';
	import SettingsWalletsWallet from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsWallet.svelte';
	import SettingsWalletsAdd from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsAdd.svelte';
	import SettingsNetworksRPCServers from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksRPCServers.svelte';
	import SettingsNetworksAddEdit from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksAddEdit.svelte';
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

	let networksTokensItems = $derived.by(() => {
		return $networks.map((network: INetwork) => ({
			title: 'Tokens',
			name: 'networks-tokens-' + network.guid,
			body: SettingsNetworksTokens,
			props: { item: network.guid },
		}));
	});

	let networksItems = $derived.by(() => {
		const networkEditItems = $networks.map((network: INetwork) => ({
			title: 'Edit network',
			name: 'networks-edit-' + network.guid,
			body: SettingsNetworksAddEdit,
			props: { network },
		}));
		const networksRPCItems = $networks.map((network: INetwork) => ({
			title: 'RPC servers',
			name: 'networks-rpc-' + network.guid,
			body: SettingsNetworksRPCServers,
			props: { network },
		}));
		return [...networkEditItems, ...networksRPCItems, ...networksTokensItems];
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
						...networksTokensItems,
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
