<script>

 import Button from '../../../core/components/button.svelte';
 import ComboBox from '../../../core/components/combo-box.svelte';
 import { derived, get } from "svelte/store";
 import { currencies, selectedMainCurrencySymbol } from "../wallet.ts";

 let currency;
 let address;
 let amount;

 $: if (!currency || !get(currencies).find((c) => c == currency ))
 {
  currency = $selectedMainCurrencySymbol;
  console.log('reset currency:', currency, get(currencies));
 }

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
