<script>
 import Button from '../../../core/components/button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import DropdownFilter from '../../../core/components/dropdown-filter.svelte';
 import SendModal from '../modals/send.svelte';
 import { get } from 'svelte/store';
 import { currencies, selectedMainCurrencySymbol, sendTransaction } from '../wallet.ts';
 import { parseUnits } from 'ethers';

 let currency = 'kETH';
 let address = '0x53383667bC8853477337416403Cb5b0967e01470'; // 'to do: "ENS name"';
 let amount = 10;
 let fee = 10;

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
  console.log('SEND:', address, etherValue, etherValueFee, currency);
  //showSendModal = true;
  //try {
  await sendTransaction(address, etherValue, etherValueFee, currency);
  console.log('Transaction sent successfully');
  showSendModal = true;
  /*} catch (e) {
   console.error('Error sending transaction:', e);
   error = 'Error sending transaction';
  }*/
 }
</script>

<style>
 input,
 select {
  padding: 5px;
  border-radius: 10px;
  border: 1px solid #888;
  font: inherit;
  background-color: #fff;
 }

 .send {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }
</style>

<div class="send">
 <div class="group">
  <div class="label">Send to:</div>
  <div class="input"><input type="text" bind:value={address} /></div>
 </div>
 <div class="input">
  Currency:
  <DropdownFilter options={$currencies} bind:selected={currency} />
 </div>
 <div class="group">
  <div class="label">Amount:</div>
  <div class="input"><input type="text" bind:value={amount} /></div>
 </div>
 <div class="group">
  <div class="label">Transaction fee:</div>
  <div class="input"><input type="text" bind:value={fee} /></div>
  <div class="error">{error}</div>
 </div>
 <Button text="Send" on:click={send} />
</div>
<Modal title="Confirm send" bind:show={showSendModal} body={SendModal} />
