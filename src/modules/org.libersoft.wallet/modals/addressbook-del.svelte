<script>
 import Button from '../../../core/components/button.svelte';
 import { addressBook } from '../wallet';
 export let close;
 export let params;
 let error;

 function clickDelete() {
  addressBook.set($addressBook.filter(i => i.guid !== params.item.guid));
  close();
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

<div>Would you like to delete the item "{params.item.alias}"?</div>
{#if error}
 <div class="error">
  <div class="bold">Error:</div>
  <div>{error}</div>
 </div>
{/if}
<Button text="Delete" onClick={clickDelete} />
