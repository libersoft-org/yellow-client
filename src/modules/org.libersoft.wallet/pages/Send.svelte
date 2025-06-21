<script>
	import { get } from 'svelte/store';
	import { parseUnits } from 'ethers';
	import { sendAddress, currencies, selectedMainCurrencySymbol, sendTransaction, selectedNetwork, selectedAddress } from '../wallet.ts';
	import { module } from '../module.ts';
	import Label from '@/core/components/Label/Label.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import SendModal from '../modals/Send.svelte';
	let currency = '';
	let amount = 0;
	let fee = 0;
	let etherValue;
	let etherValueFee;
	let error;
	let showSendModal = false;

	$: if (!currency || !get(currencies).find(c => c == currency)) {
		console.log('reset currency field:', currency, get(currencies));
		currency = $selectedMainCurrencySymbol;
	}
	$: console.log('currencies:', $currencies);
	$: console.log('currency:', currency);
	$: updateAmount(amount);
	$: updateFee(fee);

	function updateAmount(amount) {
		console.log('amount:', amount);
		try {
			etherValue = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
			console.log('etherValue:', etherValue.toString());
		} catch (e) {
			error = 'Invalid amount';
			console.log('Invalid amount:', e);
			return;
		}
		error = '';
	}

	function updateFee(amount) {
		console.log('fee:', amount);
		try {
			etherValueFee = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
			console.log('etherValueFee:', etherValueFee.toString());
		} catch (e) {
			error = 'Invalid fee';
			console.log('Invalid fee:', e);
			return;
		}
		error = '';
	}

	async function send() {
		console.log('SEND:', $sendAddress, etherValue, etherValueFee, currency);
		//showSendModal = true;
		//try {
		await sendTransaction($sendAddress, etherValue, etherValueFee, currency);
		console.log('Transaction sent successfully');
		showSendModal = true;
		/*} catch (e) {
   console.error('Error sending transaction:', e);
   error = 'Error sending transaction';
  }*/
	}
</script>

<style>
	.send {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>

<div class="send">
	<Label text="Send to">
		<Input bind:value={$sendAddress} enabled={!!($selectedNetwork && $selectedAddress)} />
	</Label>
	<Label text="Currency">
		<DropdownFilter options={$currencies} bind:selected={currency} enabled={!!($selectedNetwork && $selectedAddress)} />
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
</div>
<Modal title="Confirm send" bind:show={showSendModal} body={SendModal} />
