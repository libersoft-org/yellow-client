<script>
 import { networks } from '../wallet.ts';
 import Button from '../../../core/components/button.svelte';
 import { onMount } from 'svelte';
 export let show;
 export let params;
 export let item = null;
 let item_name = '';
 let item_currency_symbol = '';
 let item_currency_iconURL = '';
 let item_chain_id = '';
 let item_explorer_url = '';
 let item_rpc_urls = [];

 onMount(() => {
  console.log('edit-network', item);
  if (item) {
   item_name = item.name;
   item_currency_symbol = item.currency.symbol;
   item_currency_iconURL = item.currency.iconURL;
   item_chain_id = item.chainID;
   item_explorer_url = item.explorerURL;
   item_rpc_urls = item.rpcURLs.map(v => v);
  }
 });

 function save() {
  item.name = item_name;
  item.currency.symbol = item_currency_symbol;
  item.currency.iconURL = item_currency_iconURL;
  item.chainId = item_chain_id;
  item.explorerURL = item_explorer_url;
  item.rpcURL = item_rpc_urls;
  networks.update(v => v);
  show = false;
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
  <div class="label">Currency symbol:</div>
  <input bind:value={item_currency_symbol} />
 </div>
 <div class="group">
  <div class="label">Icon URL:</div>
  <input bind:value={item_currency_iconURL} />
 </div>
 <div class="group">
  <div class="label">Chain ID:</div>
  <input bind:value={item_chain_id} />
 </div>
 <div class="group">
  <div class="label">Explorer URL:</div>
  <input bind:value={item_explorer_url} />
 </div>
 <div class="group">
  <div class="label">RPC URLs:</div>
  {#each item_rpc_urls as rpc_url, i}
   <div class="group">
    <input bind:value={item_rpc_urls[i]} />
    <Button text="Remove RPC URL" on:click={() => (item_rpc_urls = item_rpc_urls.filter((v, j) => j !== i))} />
   </div>
  {/each}
  <Button text="Add RPC URL" on:click={() => (item_rpc_urls = [...item_rpc_urls, ''])} />
 </div>

 <div class="buttons">
  <Button on:click={() => (show = false)}>Cancel</Button>
  <Button
   on:click={() => {
    save();
    show = false;
   }}>Save</Button
  >
 </div>
</div>
