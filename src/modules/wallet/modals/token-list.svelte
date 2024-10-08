<script>
 import { networks } from '../wallet.ts';
 import { writable } from 'svelte/store';
 import Button from '../../../core/components/button.svelte';
 import { onMount } from 'svelte';

 export let onClose;
 export let item = null;

 let item_tokens = [];

 onMount(() => {
  if (item) {
   item_tokens = (item.tokens || []).map(v => v);
  }
 });

 function save() {
  item.tokens = item_tokens;
  networks.update(v => v);
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
  <div class="label">Network name: {item.name}</div>
 </div>
 <div class="group">
  <div class="label">Tokens:</div>
  <hr />
  {#each item_tokens as token, i}
   <div class="group">
    Name: <input bind:value={token.name} />
    Icon: <input bind:value={token.icon} />
    Symbol: <input bind:value={token.symbol} />
    Contract address: <input bind:value={token.contract_address} />
    <Button text="Remove token" on:click={() => (item_tokens = item_tokens.filter((v, j) => j !== i))} />
   </div>
  {/each}
  <hr />
  <Button text="Add token" on:click={() => (item_tokens = [...item_tokens, { name: '', icon: '', symbol: '', contract_address: '' }])} />
 </div>

 <div class="buttons">
  <Button on:click={() => onClose()}>Cancel</Button>
  <Button
   on:click={() => {
    save();
    onClose();
   }}>Save</Button
  >
 </div>
</div>
