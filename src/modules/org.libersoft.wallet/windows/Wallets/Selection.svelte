<script lang="ts">
	import { wallets, type IWallet } from 'libersoft-crypto/wallet';
	import { walletsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import { attachParents } from '@/core/scripts/base_settings.ts';
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import SelectionWallets from '@/org.libersoft.wallet/windows/Wallets/SelectionWallets.svelte';
	import SelectionWalletsWallet from '@/org.libersoft.wallet/windows/Wallets/SelectionWalletsWallet.svelte';
	let elBaseSettings: BaseSettings | undefined;

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

	let settingsObject = $derived.by(() => {
		return attachParents({
			title: 'Wallets',
			name: 'wallets',
			body: SelectionWallets,
			items: walletsItems,
		});
	});

	$effect(() => {
		walletsWindow.set(elBaseSettings);
	});
</script>

<BaseSettings {settingsObject} bind:this={elBaseSettings} />
