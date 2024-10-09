<script>
 import { networks } from '../wallet.ts';
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
 .token-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .buttons {
  display: flex;
  gap: 10px;
 }
</style>

<div class="token-list">
 <Button text="Add token" on:click={() => (item_tokens = [...item_tokens, { name: '', icon: '', symbol: '', contract_address: '' }])} />
 <div class="group">
  <div class="label">Network name: {item.name}</div>
 </div>
 <div class="group">
  <div class="label">Tokens:</div>
  <hr />
  {#each item_tokens as token, i}
   <!-- TODO table !!! -->
   <Button text="Remove token" on:click={() => (item_tokens = item_tokens.filter((v, j) => j !== i))} />
  {/each}
  <hr />
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
