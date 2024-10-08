<script>
 import Button from '../../../core/components/button.svelte';
 import ComboBox from '../../../core/components/combo-box.svelte';
 import { derived, get } from 'svelte/store';
 import { currencies, selectedMainCurrencySymbol } from '../wallet.ts';
 import { parseUnits } from 'ethers';

 let currency;
 let address;
 let amount = 0;
 let fee = 0;
 let etherValue;
 let etherValueFee;
 let error;

 $: if (!currency || !get(currencies).find(c => c == currency)) {
  currency = $selectedMainCurrencySymbol;
  console.log('reset currency:', currency, get(currencies));
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
   etherValue = parseUnits(amount.toString(), 18); // 18 is the number of decimals for Ether
   console.log('etherValue:', etherValue.toString());
  } catch (e) {
   error = 'Invalid fee';
   console.log('Invalid fee:', e);
   return;
  }
  error = '';
 }

 function send() {
  console.log('SEND:', address, etherValue, etherValueFee, currency);



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
  <ComboBox options={$currencies} bind:value={currency} />
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
