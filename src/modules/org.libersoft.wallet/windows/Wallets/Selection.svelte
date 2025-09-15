<script lang="ts">
	import { wallets, type IWallet } from 'libersoft-crypto/wallet';
	import { walletsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import { attachParents } from '@/core/scripts/base_settings.ts';
	import BaseSettingsWindow from '@/core/components/Settings/BaseSettingsWindow.svelte';
	import type { ISettingsNode, IBaseSettingsInstance } from '@/core/types/settings.ts';
	import SelectionWallets from '@/org.libersoft.wallet/windows/Wallets/SelectionWallets.svelte';
	import SelectionWalletsWallet from '@/org.libersoft.wallet/windows/Wallets/SelectionWalletsWallet.svelte';
	let elBaseSettings: IBaseSettingsInstance | undefined;

	// Debug information
	//console.log('Wallets.svelte - $wallets:', $wallets);

	let walletsItems = $derived.by(() => {
		console.log('Wallets.svelte - generating walletsItems for wallets:', $wallets);
		return $wallets.map((wallet: IWallet) => ({
			title: wallet.name,
			name: 'wallets-' + wallet.guid,
			body: SelectionWalletsWallet,
			props: {
				params: {
					wallet,
				},
			},
		}));
	});

	let settingsObject: ISettingsNode = $derived.by(() => {
		return attachParents({
			title: 'Wallets',
			name: 'wallets',
			body: SelectionWallets,
			items: walletsItems,
		});
	});

	$effect(() => {
		walletsWindow.set(elBaseSettings ?? null);
	});
</script>

<BaseSettingsWindow {settingsObject} bind:this={elBaseSettings} />
