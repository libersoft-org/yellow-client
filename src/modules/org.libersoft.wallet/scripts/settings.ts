import { derived, type Readable, get } from 'svelte/store';
import { module } from '@/org.libersoft.wallet/scripts/module';
import { wallets, type IWallet } from 'libersoft-crypto/wallet';
import { networks, default_networks, type INetwork } from 'libersoft-crypto/network';
import { settingsWindow } from '@/org.libersoft.wallet/scripts/ui';
import { addressBook, type IAddressBookItem } from 'libersoft-crypto/addressbook';
import { attachParents } from '@/core/scripts/base_settings.ts';
import type { ISettingsObject, IBaseSettingsInstance } from '@/core/types/settings.ts';
import SettingsGeneral from '@/org.libersoft.wallet/windows/Settings/SettingsGeneral.svelte';
import SettingsNetworks from '@/org.libersoft.wallet/windows/Settings/SettingsNetworks.svelte';
import SettingsNetworksTokens from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksTokens.svelte';
import SettingsNetworksNFTs from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksNFTs.svelte';
import SettingsWallets from '@/org.libersoft.wallet/windows/Settings/SettingsWallets.svelte';
import SettingsAddressbook from '@/org.libersoft.wallet/windows/Settings/SettingsAddressbook.svelte';
import SettingsWalletsWallet from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsWallet.svelte';
import SettingsWalletsAddSW from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsAddSW.svelte';
import SettingsWalletsAddHWWalletTrezor from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsAddHWWalletTrezor.svelte';
import SettingsWalletsAddHWWalletLedger from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsAddHWWalletLedger.svelte';
import RPCServers from '@/org.libersoft.wallet/windows/RPCServers/Selection.svelte';
import SettingsNetworksAdd from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksAdd.svelte';
import SettingsNetworksAddEdit from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksAddEdit.svelte';
import SettingsNetworksImport from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksImport.svelte';
import SettingsNetworksExport from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksExport.svelte';
import SettingsNetworksTokensAddEdit from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksTokensAddEdit.svelte';
import SettingsNetworksTokensPopular from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksTokensPopular.svelte';
import SettingsNetworksNFTsAddEdit from '@/org.libersoft.wallet/windows/Settings/SettingsNetworksNFTsAddEdit.svelte';
import SettingsAddressbookAddEdit from '@/org.libersoft.wallet/windows/Settings/SettingsAddressbookAddEdit.svelte';
import SettingsAddressbookImport from '@/org.libersoft.wallet/windows/Settings/SettingsAddressbookImport.svelte';
import SettingsAddressbookExport from '@/org.libersoft.wallet/windows/Settings/SettingsAddressbookExport.svelte';
import SettingsWalletsEdit from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsEdit.svelte';
import SettingsWalletsRecover from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsRecover.svelte';
import SettingsWalletsAddressAdd from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsAddressAdd.svelte';
import SettingsWalletsAddressEdit from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsAddressEdit.svelte';
import SettingsWalletsWalletExport from '@/org.libersoft.wallet/windows/Settings/SettingsWalletsWalletExport.svelte';

function getSettingsWindow() {
	return get(settingsWindow);
}

export const walletsItems: Readable<any[]> = derived([wallets], ([$wallets]) => {
	return $wallets.map((wallet: IWallet) => ({
		title: wallet.name,
		name: 'wallets-' + wallet.guid,
		body: SettingsWalletsWallet,
		props: {
			params: {
				wallet,
			},
		},
		items: [
			{
				title: 'Add address',
				name: 'wallets-address-add-' + wallet.guid,
				body: SettingsWalletsAddressAdd,
				props: {
					wallet,
					close: () => getSettingsWindow()?.setSettingsSection('wallets-' + wallet.guid),
				},
			},
			{
				title: 'Export',
				name: 'wallets-wallet-export-' + wallet.guid,
				body: SettingsWalletsWalletExport,
				props: {
					wallet,
					close: () => getSettingsWindow()?.setSettingsSection('wallets-' + wallet.guid),
				},
			},
			...(wallet.addresses || []).map(address => ({
				title: 'Edit address',
				name: 'wallets-address-edit-' + wallet.guid + '-' + address.index,
				body: SettingsWalletsAddressEdit,
				props: {
					wallet,
					index: address.index,
					close: () => getSettingsWindow()?.setSettingsSection('wallets-' + wallet.guid),
				},
			})),
		],
	}));
});

export const walletsEditItems: Readable<any[]> = derived([wallets], ([$wallets]) => {
	return $wallets.map((wallet: IWallet) => ({
		title: 'Edit ' + wallet.name,
		name: 'wallets-edit-' + wallet.guid,
		body: SettingsWalletsEdit,
		props: {
			wallet,
			close: () => getSettingsWindow()?.setSettingsSection('wallets'),
		},
	}));
});

export const networksTokensItems: Readable<any[]> = derived([networks], ([$networks]) => {
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
					close: () => getSettingsWindow()?.setSettingsSection('networks-tokens-' + network.guid),
					networkGuid: network.guid,
				},
			},
			{
				title: 'Popular tokens',
				name: 'networks-tokens-popular-' + network.guid,
				body: SettingsNetworksTokensPopular,
				props: {
					close: () => getSettingsWindow()?.setSettingsSection('networks-tokens-' + network.guid),
					item: network.guid,
				},
			},
			...(network.tokens || []).map((token: any) => ({
				title: 'Edit token',
				name: 'networks-tokens-edit-' + network.guid + '-' + token.guid,
				body: SettingsNetworksTokensAddEdit,
				props: {
					close: () => getSettingsWindow()?.setSettingsSection('networks-tokens-' + network.guid),
					networkGuid: network.guid,
					item: token,
				},
			})),
		],
	}));
});

export const networksNFTsItems: Readable<any[]> = derived([networks], ([$networks]) => {
	return $networks.map((network: INetwork) => ({
		title: 'NFTs',
		name: 'networks-nfts-' + network.guid,
		body: SettingsNetworksNFTs,
		props: { item: network.guid },
		items: [
			{
				title: 'Add NFT Contract',
				name: 'networks-nfts-add-' + network.guid,
				body: SettingsNetworksNFTsAddEdit,
				props: {
					close: () => getSettingsWindow()?.setSettingsSection('networks-nfts-' + network.guid),
					networkGuid: network.guid,
				},
			},
			...(network.nfts || []).map((nft: any) => ({
				title: 'Edit NFT Contract',
				name: 'networks-nfts-edit-' + network.guid + '-' + nft.guid,
				body: SettingsNetworksNFTsAddEdit,
				props: {
					close: () => getSettingsWindow()?.setSettingsSection('networks-nfts-' + network.guid),
					networkGuid: network.guid,
					item: nft,
				},
			})),
		],
	}));
});

export const networksItems: Readable<any[]> = derived([networks, default_networks, networksTokensItems, networksNFTsItems], ([$networks, $default_networks, $networksTokensItems, $networksNFTsItems]) => {
	const networkEditItems = $networks.map((network: INetwork) => ({
		title: 'Edit network',
		name: 'networks-edit-' + network.guid,
		body: SettingsNetworksAddEdit,
		props: { network, edit: true },
	}));
	const networksRPCItems = $networks.map((network: INetwork) => ({
		title: 'RPC servers',
		name: 'networks-rpc-' + network.guid,
		body: RPCServers,
		props: { network },
	}));
	const defaultNetworksRPCItems = $default_networks.map((network: INetwork) => ({
		title: 'RPC servers',
		name: 'networks-rpc-' + network.guid,
		body: RPCServers,
		props: { network },
	}));
	return [...networkEditItems, ...networksRPCItems, ...defaultNetworksRPCItems, ...$networksTokensItems, ...$networksNFTsItems];
});

export const addressbookItems: Readable<any[]> = derived([addressBook], ([$addressBook]) => {
	return $addressBook.map((item: IAddressBookItem) => ({
		title: 'Edit ' + item.name,
		name: 'addressbook-edit-' + item.guid,
		body: SettingsAddressbookAddEdit,
		props: {
			item,
			close: () => getSettingsWindow()?.setSettingsSection('addressbook'),
		},
	}));
});

export const settingsObject: Readable<ISettingsObject> = derived([walletsItems, walletsEditItems, networksItems, networksTokensItems, addressbookItems], ([$walletsItems, $walletsEditItems, $networksItems, $networksTokensItems, $addressbookItems]) =>
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
					...$networksItems,
					{
						title: 'Add a new network',
						name: 'networks-add',
						body: SettingsNetworksAdd,
						items: [
							{
								title: 'Custom network',
								name: 'networks-add-sw',
								body: SettingsNetworksAddEdit,
							},
						],
					},
					{
						title: 'Import',
						name: 'networks-import',
						body: SettingsNetworksImport,
						props: {
							close: () => getSettingsWindow()?.setSettingsSection('networks'),
						},
					},
					{
						title: 'Export',
						name: 'networks-export',
						body: SettingsNetworksExport,
						props: {
							close: () => getSettingsWindow()?.setSettingsSection('networks'),
						},
					},
					...$networksTokensItems,
				],
			},
			{
				title: 'Wallets',
				name: 'wallets',
				body: SettingsWallets,
				items: [
					...$walletsItems,
					...$walletsEditItems,
					{
						title: 'Add a new wallet',
						name: 'wallets-add',
						menu: [
							{
								img: 'modules/' + module.identifier + '/img/wallet.svg',
								title: 'Local (software)	wallet',
								name: 'wallets-add-sw',
							},
							{
								img: 'modules/' + module.identifier + '/img/wallet-trezor.svg',
								title: 'Trezor',
								name: 'wallets-add-hw-trezor',
							},
							{
								img: 'modules/' + module.identifier + '/img/wallet-ledger.svg',
								title: 'Ledger',
								name: 'wallets-add-hw-ledger',
							},
						],
						items: [
							{
								title: 'Local	wallet',
								name: 'wallets-add-sw',
								body: SettingsWalletsAddSW,
							},
							{
								title: 'Trezor',
								name: 'wallets-add-hw-trezor',
								body: SettingsWalletsAddHWWalletTrezor,
							},
							{
								title: 'Ledger',
								name: 'wallets-add-hw-ledger',
								body: SettingsWalletsAddHWWalletLedger,
							},
						],
					},
					{
						title: 'Recover from seed',
						name: 'wallets-recover',
						body: SettingsWalletsRecover,
						props: {
							close: () => getSettingsWindow()?.setSettingsSection('wallets'),
						},
					},
				],
			},
			{
				title: 'Address book',
				name: 'addressbook',
				body: SettingsAddressbook,
				items: [
					...$addressbookItems,
					{
						title: 'Add a new address',
						name: 'addressbook-add',
						body: SettingsAddressbookAddEdit,
						props: {
							close: () => getSettingsWindow()?.setSettingsSection('addressbook'),
						},
					},
					{
						title: 'Import',
						name: 'addressbook-import',
						body: SettingsAddressbookImport,
						props: {
							close: () => getSettingsWindow()?.setSettingsSection('addressbook'),
						},
					},
					{
						title: 'Export',
						name: 'addressbook-export',
						body: SettingsAddressbookExport,
						props: {
							close: () => getSettingsWindow()?.setSettingsSection('addressbook'),
						},
					},
				],
			},
		],
	})
);
