<script lang="ts">
	import { wallets, type IWallet, walletsModal } from '../../scripts/wallet.ts';
	import { attachParents } from '@/core/scripts/base_settings.ts';
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import SectionWallets from './SectionWallets.svelte';
	import SectionAddresses from './SectionAddresses.svelte';
	let elBaseSettings: BaseSettings | undefined;

	// Debug information
	//console.log('Wallets.svelte - $wallets:', $wallets);

	let walletsItems = $derived.by(() => {
		console.log('Wallets.svelte - generating walletsItems for wallets:', $wallets);
		return $wallets.map((wallet: IWallet) => ({
			title: wallet.name,
			name: 'wallets-' + wallet.address,
			body: SectionAddresses,
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
			body: SectionWallets,
			items: walletsItems,
		});
	});

	$inspect(settingsObject, 'Wallets address selector BaseSettings object');

	$effect(() => {
		walletsModal.set(elBaseSettings);
	});
</script>

<BaseSettings {settingsObject} bind:this={elBaseSettings} />
