<script lang="ts">
	import { parseUnits } from 'ethers';
	import { sendAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { selectedNetwork } from '@/org.libersoft.wallet/scripts/network.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { currencies } from '@/org.libersoft.wallet/scripts/balance.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	import DialogSend from '@/org.libersoft.wallet/dialogs/Send.svelte';
	let currency: string | null | undefined;
	let amount: string | number | undefined = 0;
	let fee: string | number | undefined = 0;
	let error: string | null | undefined;
	let elDialogSend;
	let params;

	function getEtherAmount(amount) {
		error = null;
		try {
			let etherAmount: bigint = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
			return etherAmount;
		} catch (e) {
			error = 'Invalid amount';
			return null;
		}
	}

	async function send() {
		params = {
			address: $sendAddress,
			amount: getEtherAmount(amount),
			fee: getEtherAmount(fee),
			currency: currency,
		};
		elDialogSend?.open();
	}
</script>

<style>
	.send {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>

<div class="send">
	<Form onSubmit={send} width="400px">
		<Label text="Address">
			<Input bind:value={$sendAddress} enabled={!!($selectedNetwork && $selectedAddress)} />
		</Label>
		<Label text="Currency">
			<DropdownFilter options={$currencies} enabled={!!($selectedNetwork && $selectedAddress)} />
		</Label>
		<Label text="Amount">
			<Input bind:value={amount} enabled={!!($selectedNetwork && $selectedAddress)} />
		</Label>
		<Label text="Max transaction fee">
			<Input bind:value={fee} enabled={!!($selectedNetwork && $selectedAddress)} />
		</Label>
		{#if error}
			<Alert type="error" message={error} />
		{/if}
		<Button img="modules/{module.identifier}/img/send.svg" text="Send" enabled={!!($selectedNetwork && $selectedAddress)} onClick={send} />
	</Form>
</div>
<DialogSend {params} bind:this={elDialogSend} />
