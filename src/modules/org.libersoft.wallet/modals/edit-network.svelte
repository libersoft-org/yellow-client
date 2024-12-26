<script>
 import { networks } from '../wallet.ts';
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 import { onMount } from 'svelte';
 export let close;
 export let params;

 let item_guid = '';
 let item_name = '';
 let item_currency_symbol = '';
 let item_currency_iconURL = '';
 let item_chain_id = '';
 let item_explorer_url = '';
 let item_rpc_urls = [];

 $: update(params);

 function update(params) {
  //console.log('update', params);
  if (item_guid) return;
  let item = params.item;
  if (item) {
   item_name = item.name;
   item_currency_symbol = item.currency.symbol;
   item_currency_iconURL = item.currency.iconURL;
   item_chain_id = item.chainID;
   item_explorer_url = item.explorerURL;
   item_rpc_urls = item.rpcURLs.map(v => v);
  }
 }

 function save() {
  let item = $networks.find(v => v.guid === params.item.guid);
  if (!item) {
   window.alert('Network not found');
   return;
  }
  item.name = item_name;
  item.currency.symbol = item_currency_symbol;
  item.currency.iconURL = item_currency_iconURL;
  item.chainId = item_chain_id;
  item.explorerURL = item_explorer_url;
  item.rpcURLs = item_rpc_urls;
  networks.update(v => v);
  close();
 }

 function saveAndClose() {
  save();
  close();
 }
</script>

<style>
 .modal-edit-network {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .modal-edit-network .buttons {
  display: flex;
  gap: 10px;
 }
</style>

<div class="modal-edit-network">
 <div class="group">
  <div class="label">Name:</div>
  <InputText bind:value={item_name} />
 </div>
 <div class="group">
  <div class="label">Currency symbol:</div>
  <InputText bind:value={item_currency_symbol} />
 </div>
 <div class="group">
  <div class="label">Icon URL:</div>
  <InputText bind:value={item_currency_iconURL} />
 </div>
 <div class="group">
  <div class="label">Chain ID:</div>
  <InputText bind:value={item_chain_id} />
 </div>
 <div class="group">
  <div class="label">Explorer URL:</div>
  <InputText bind:value={item_explorer_url} />
 </div>
 <div class="group">
  <div class="label">RPC URLs:</div>
  {#each item_rpc_urls as rpc_url, i}
   <div class="group">
    <InputText bind:value={item_rpc_urls[i]} />
    <Button text="Remove RPC URL" onClick={() => (item_rpc_urls = item_rpc_urls.filter((v, j) => j !== i))} />
   </div>
  {/each}
  <Button text="Add RPC URL" onClick={() => (item_rpc_urls = [...item_rpc_urls, ''])} />
 </div>
 <div class="buttons">
  <Button text="Cancel" onClick={close} />
  <Button text="Save" onClick={saveAndClose} />
 </div>
</div>
