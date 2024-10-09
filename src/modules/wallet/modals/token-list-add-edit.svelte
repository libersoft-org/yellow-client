<script>
 import Button from '../../../core/components/button.svelte';
 export let token;

 function clickAdd() {
  // TODO
 }
</script>

<style>
 .group {
 }

 input {
  padding: 5px;
 }
</style>

<div class="group">
 <div class="label">Name:</div>
 <input bind:value={token.name} />
</div>
<div class="group">
 <div class="label">Icon:</div>
 <input bind:value={token.icon} />
</div>
<div class="group">
 <div class="label">Symbol:</div>
 <input bind:value={token.symbol} />
</div>
<div class="group">
 <div class="label">Contract address:</div>
 <input bind:value={token.contract_address} />
</div>
<Button text="Add token" on:click={clickAdd} />
