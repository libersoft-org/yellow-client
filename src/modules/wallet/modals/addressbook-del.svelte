<script>
 import Button from '../../../core/components/button.svelte';
 export let onClose;
 export let item;
 let error;

 function clickDelete() {
  // TODO
  onClose();
 }
</script>

<style>
 .error {
  display: flex;
  gap: 5px;
  padding: 10px;
  border: 1px solid #f00;
  border-radius: 10px;
  background-color: #faa;
 }
</style>

<div>Would you like to delete the item: {item}</div>
{#if error}
 <div class="error">
  <div class="bold">Error:</div>
  <div>{error}</div>
 </div>
{/if}
<Button text="Delete" on:click={clickDelete} />
