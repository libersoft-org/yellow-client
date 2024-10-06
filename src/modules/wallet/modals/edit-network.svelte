<script>
 import { networks } from '../wallet.ts';
 import { writable } from 'svelte/store';
 import Button from '../../../core/components/button.svelte';
 import { onMount } from "svelte";

 export let onClose;
 export let item = null;

 let item_name = '';
 let item_currency = '';
 let item_currency_iconURL = '';


 onMount(() => {
  console.log('edit-network', item);
  if (item) {
   item_name = item.name;
   item_currency = item.currency;
   item_currency_iconURL = item.currency.iconURL;
  }
  else {
   item_name = '';
   item_currency = '';
   item_currency_iconURL = '';
  }
 });

 function save()
 {
  item.name = item_name;
  item.currency = item_currency;
  item.currency.iconURL = item_currency_iconURL;
  networks.update((v) => v);
  onClose();
 }

</script>

<style>
 .modal-edit-network {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .modal-edit-network input {
  padding: 5px;
 }

 .modal-edit-network .buttons {
  display: flex;
  gap: 10px;
 }

 </style>

<div class="modal-edit-network">
 <div class="group">
  <div class="label">Name:</div>
  <input bind:value={item_name} />
 </div>
 <div class="group">
  <div class="label">Currency:</div>
  <input bind:value={item_currency} />
 </div>
 <div class="group">
  <div class="label">Icon URL:</div>
  <input bind:value={item_currency_iconURL} />
 </div>
 <div class="buttons">
  <Button on:click={() => onClose()}>Cancel</Button>
  <Button on:click={() => {save(); onClose();}}>Save</Button>
 </div>
</div>

