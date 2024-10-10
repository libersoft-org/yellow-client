<script>
 import Button from '../../../core/components/button.svelte';
 import { onMount } from 'svelte';
 import { networks } from "../wallet.ts";
 export let show;
 export let params;

 let item_name = '';
 let item_icon = '';
 let item_symbol = '';
 let item_contract_address = '';

 onMount(() => {
  let item = params.item;
  if (item) {
   item_name = item.name;
   item_icon = item.icon;
   item_symbol = item.symbol;
   item_contract_address = item.contract_address;
  }
 });

 function clickAdd() {
  params.onAdd({
   name: item_name,
   icon: item_icon,
   symbol: item_symbol,
   contract_address: item_contract_address
  });
 }
</script>

<style>
 .group {
  display: flex;
  flex-direction: column;
 }

 .group .label {
  font-weight: bold;
  margin-left: 5px;
 }

 input {
  padding: 5px;
 }
</style>

<div class="group">
 <div class="label">Name:</div>
 <input bind:value={item_name} />
</div>
<div class="group">
 <div class="label">Icon:</div>
 <input bind:value={item_icon} />
</div>
<div class="group">
 <div class="label">Symbol:</div>
 <input bind:value={item_symbol} />
</div>
<div class="group">
 <div class="label">Contract address:</div>
 <input bind:value={item_contract_address} />
</div>
<Button text="Add token" on:click={clickAdd} />
