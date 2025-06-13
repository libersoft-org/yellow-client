<script>
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import SendModal from '../modals/Send.svelte';
	import { get } from 'svelte/store';
	import { sendAddress, currencies, selectedMainCurrencySymbol, sendTransaction, selectedNetwork, selectedAddress } from '../wallet.ts';
	import { parseUnits } from 'ethers';
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

	.group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.group .label {
		padding-left: 3px;
		font-weight: bold;
	}
</style>

<div class="send">
	<div class="group">
		<div class="label">Send to:</div>
		<div class="input"><Input bind:value={$sendAddress} enabled={!!($selectedNetwork && $selectedAddress)} /></div>
	</div>
	<div class="group">
		<div class="label">Currency:</div>
		<div class="input"><DropdownFilter options={$currencies} bind:selected={currency} enabled={!!($selectedNetwork && $selectedAddress)} /></div>
	</div>
	<div class="group">
		<div class="label">Amount:</div>
		<div class="input"><Input bind:value={amount} enabled={!!($selectedNetwork && $selectedAddress)} /></div>
	</div>
	<div class="group">
		<div class="label">Max transaction fee:</div>
		<div class="input"><Input bind:value={fee} enabled={!!($selectedNetwork && $selectedAddress)} /></div>
		{#if error}
			<Alert type="error" message={error} />
		{/if}
	</div>
	<Button text="Send" enabled={!!($selectedNetwork && $selectedAddress)} onClick={send} />
</div>
<Modal title="Confirm send" bind:show={showSendModal} body={SendModal} />
