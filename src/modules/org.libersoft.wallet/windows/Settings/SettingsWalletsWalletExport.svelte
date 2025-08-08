<script lang="ts">
	import Export from '@/core/components/Export/Export.svelte';
	import { type IWallet } from '@/org.libersoft.wallet/scripts/wallet.ts';
	interface Props {
		wallet: IWallet;
		close: () => void;
	}
	let { wallet, close }: Props = $props();
</script>

<Export data={wallet.phrase} filename="wallet-seed" isSensitive testId="wallet-export" />
