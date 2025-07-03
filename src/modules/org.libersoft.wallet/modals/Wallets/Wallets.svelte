<script lang="ts">
	import { wallets, type IWallet } from '../../wallet.ts';
	import { attachParents } from '@/core/base_settings.ts';
	import BaseSettings from '@/core/components/Settings/BaseSettings.svelte';
	import SectionWallets from './SectionWallets.svelte';
	import SectionAddresses from './SectionAddresses.svelte';
	let elBaseSettings: BaseSettings | undefined;

	// Debug information
	console.log('Wallets.svelte - $wallets:', $wallets);

	let walletsItems = $derived.by(() => {
		console.log('Wallets.svelte - generating walletsItems for wallets:', $wallets);
		return $wallets.map((wallet: IWallet) => ({
			title: wallet.name,
			name: 'addresses-' + wallet.address,
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
			items: [walletsItems],
		});
	});

	export function onOpen() {
		window.alert('Opening Wallets modal');
		console.log('Wallets.svelte - opening modal');
		elBaseSettings?.open();
		console.log('Wallets.svelte - modal opened');
	}
</script>

addresy zde?
<BaseSettings {settingsObject} bind:this={elBaseSettings} />
