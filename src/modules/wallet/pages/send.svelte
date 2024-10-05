<script>

 import Button from '../../../core/components/button.svelte';
 import ComboBox from '../../../core/components/combo-box.svelte';
 import { derived } from "svelte/store";
 import { selectedMainCurrencySymbol, selectedNetwork } from "../wallet.ts";


 let currency;

 let tokens = derived([selectedNetwork], ([$selectedNetwork]) => {
  return ['token1', 'token2', 'token3'].map(symbol => ({ symbol }));
 });

 let currencies = derived([tokens, selectedMainCurrencySymbol], ([$tokens, $selectedMainCurrencySymbol]) => {
  if (!currency) currency = $selectedMainCurrencySymbol;
  return [$selectedMainCurrencySymbol, ...$tokens.map(token => token.symbol)];
 });

 let address;
 let amount;

 $: console.log('currencies:', $currencies);
 $: console.log('currency:', currency);

 function send() {
  // TODO
  console.log('SEND:', address, amount, currency);
 }
</script>

<style>
 input, select {
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
  <div class="label">Address to:</div>
  <div class="input"><input type="text" bind:value={address} /></div>
 </div>
 <div class="group">
  <div class="label">Amount:</div>
  <div class="input"><input type="text" bind:value={amount} /></div>
  <div class="input">

   <ComboBox options={$currencies} bind:value={currency} />

  </div>
 </div>
 <Button text="Send" on:click={send} />
</div>
