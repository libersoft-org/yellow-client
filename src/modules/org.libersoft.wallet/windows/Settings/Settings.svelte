<script lang="ts">
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { wallets, type IWallet } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { networks, default_networks, type INetwork } from '@/org.libersoft.wallet/scripts/network.ts';
	import { settingsWindow } from '@/org.libersoft.wallet/scripts/ui.ts';
	import { addressBook, type IAddressBookItem } from '@/org.libersoft.wallet/scripts/addressbook.ts';
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
	import SettingsNetworksImport from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksImport.svelte';
	import SettingsNetworksExport from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksExport.svelte';
	import SettingsNetworksTokensAddEdit from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksTokensAddEdit.svelte';
	import SettingsAddressbookAddEdit from '@/org.libersoft.wallet/windows/Settings/SettingsAddressbookAddEdit.svelte';
	import SettingsAddressbookImport from '@/org.libersoft.wallet/windows/Settings/SettingsAddressbookImport.svelte';
	import SettingsAddressbookExport from '@/org.libersoft.wallet/windows/Settings/SettingsAddressbookExport.svelte';
	import SettingsWalletsEdit from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsEdit.svelte';
	import SettingsWalletsRecover from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsRecover.svelte';
	import SettingsWalletsAddressAdd from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsAddressAdd.svelte';
	import SettingsWalletsAddressEdit from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsAddressEdit.svelte';
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
			items: [
				{
					title: 'Add address',
					name: 'wallets-address-add-' + wallet.address,
					body: SettingsWalletsAddressAdd,
					props: {
						wallet,
						close: () => elBaseSettings?.setSettingsSection('wallets-' + wallet.address),
					},
				},
				...(wallet.addresses || []).map(address => ({
					title: 'Edit address',
					name: 'wallets-address-edit-' + wallet.address + '-' + address.index,
					body: SettingsWalletsAddressEdit,
					props: {
						wallet,
						index: address.index,
						close: () => elBaseSettings?.setSettingsSection('wallets-' + wallet.address),
					},
				})),
			],
		}));
	});

	let walletsEditItems = $derived.by(() => {
		return $wallets.map((wallet: IWallet) => ({
			title: 'Edit ' + wallet.name,
			name: 'wallets-edit-' + wallet.address,
			body: SettingsWalletsEdit,
			props: {
				wallet,
				close: () => elBaseSettings?.setSettingsSection('wallets'),
			},
		}));
	});

	let networksTokensItems = $derived.by(() => {
		return $networks.map((network: INetwork) => ({
			title: 'Tokens',
			name: 'networks-tokens-' + network.guid,
			body: SettingsNetworksTokens,
			props: { item: network.guid },
			items: [
				{
					title: 'Add token',
					name: 'networks-tokens-add-' + network.guid,
					body: SettingsNetworksTokensAddEdit,
					props: {
						close: () => elBaseSettings?.setSettingsSection('networks-tokens-' + network.guid),
						networkGuid: network.guid,
					},
				},
				...(network.tokens || []).map((token: any) => ({
					title: 'Edit token',
					name: 'networks-tokens-edit-' + network.guid + '-' + token.guid,
					body: SettingsNetworksTokensAddEdit,
					props: {
						close: () => elBaseSettings?.setSettingsSection('networks-tokens-' + network.guid),
						networkGuid: network.guid,
						item: token,
					},
				})),
			],
		}));
	});

	let networksItems = $derived.by(() => {
		const networkEditItems = $networks.map((network: INetwork) => ({
			title: 'Edit network',
			name: 'networks-edit-' + network.guid,
			body: SettingsNetworksAddEdit,
			props: { network, edit: true },
		}));
		const networksRPCItems = $networks.map((network: INetwork) => ({
			title: 'RPC servers',
			name: 'networks-rpc-' + network.guid,
			body: SettingsNetworksRPCServers,
			props: { network },
		}));
		const defaultNetworksRPCItems = $default_networks.map((network: INetwork) => ({
			title: 'RPC servers',
			name: 'networks-rpc-' + network.guid,
			body: SettingsNetworksRPCServers,
			props: { network },
		}));
		return [...networkEditItems, ...networksRPCItems, ...defaultNetworksRPCItems, ...networksTokensItems];
	});

	let addressbookItems = $derived.by(() => {
		return $addressBook.map((item: IAddressBookItem) => ({
			title: 'Edit ' + item.name,
			name: 'addressbook-edit-' + item.guid,
			body: SettingsAddressbookAddEdit,
			props: {
				item,
				close: () => elBaseSettings?.setSettingsSection('addressbook'),
			},
		}));
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
							props: {
								close: () => elBaseSettings?.setSettingsSection('networks'),
							},
						},
						{
							title: 'Import',
							name: 'networks-import',
							body: SettingsNetworksImport,
							props: {
								close: () => elBaseSettings?.setSettingsSection('networks'),
							},
						},
						{
							title: 'Export',
							name: 'networks-export',
							body: SettingsNetworksExport,
							props: {
								close: () => elBaseSettings?.setSettingsSection('networks'),
							},
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
						...walletsEditItems,
						{
							title: 'Add a new wallet',
							name: 'wallets-add',
							body: SettingsWalletsAdd,
						},
						{
							title: 'Recover from seed',
							name: 'wallets-recover',
							body: SettingsWalletsRecover,
							props: {
								close: () => elBaseSettings?.setSettingsSection('wallets'),
							},
						},
					],
				},
				{
					title: 'Address book',
					name: 'addressbook',
					body: SettingsAddressbook,
					items: [
						...addressbookItems,
						{
							title: 'Add a new address',
							name: 'addressbook-add',
							body: SettingsAddressbookAddEdit,
							props: {
								close: () => elBaseSettings?.setSettingsSection('addressbook'),
							},
						},
						{
							title: 'Import',
							name: 'addressbook-import',
							body: SettingsAddressbookImport,
							props: {
								close: () => elBaseSettings?.setSettingsSection('addressbook'),
							},
						},
						{
							title: 'Export',
							name: 'addressbook-export',
							body: SettingsAddressbookExport,
							props: {
								close: () => elBaseSettings?.setSettingsSection('addressbook'),
							},
						},
					],
				},
			],
		})
	);

	$effect(() => {
		settingsWindow.set(elBaseSettings);
	});
</script>

<BaseSettings testId="wallet-settings" {settingsObject} bind:this={elBaseSettings} />
