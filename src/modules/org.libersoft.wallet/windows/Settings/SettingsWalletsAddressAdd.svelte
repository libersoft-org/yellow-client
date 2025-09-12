<script lang="ts">
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import { type IWallet } from 'libersoft-crypto/wallet';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import FormAddressAdd from '@/org.libersoft.wallet/components/FormAddressAdd.svelte';

	interface Props {
		wallet: IWallet;
		close: () => void;
	}
	let { wallet, close }: Props = $props();
	let formAddressAdd: FormAddressAdd;

	export function onOpen(): void {
		formAddressAdd?.onOpen();
	}

	async function clickAdd(): Promise<void> {
		await formAddressAdd?.clickAdd();
	}

	function handleSuccess(): void {
		close();
	}
</script>

<FormAddressAdd bind:this={formAddressAdd} {wallet} onSuccess={handleSuccess} />
<ButtonBar expand>
	<Button img="modules/{module.identifier}/img/wallet-address-add.svg" text="Add" onClick={clickAdd} />
	<Button img="img/cancel.svg" text="Cancel" onClick={close} />
</ButtonBar>
