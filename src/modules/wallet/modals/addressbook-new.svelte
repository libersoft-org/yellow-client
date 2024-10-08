<script>
 import { onMount } from 'svelte';
 import Button from '../../../core/components/button.svelte';
 import { addressBook } from '../wallet.ts';
 export let onClose;
 let aliasElement;
 let alias = '';
 let address = '';

 onMount(() => aliasElement.focus());

 function addToAddressBook() {
  console.log('NEW ITEM IN ADDRESS BOOK:', alias, address);
  $addressBook.push({ alias, address });
  onClose();
 }
</script>

<div class="addressbook-new">
 <div class="group">
  <div class="bold">Alias:</div>
  <input type="text" placeholder="Alias" bind:value={alias} bind:this={aliasElement} />
 </div>
 <div class="group">
  <div class="bold">Address:</div>
  <input type="text" placeholder="Address" bind:value={address} />
 </div>
 <Button text="Add" on:click={addToAddressBook} />
</div>

<style>
 .addressbook-new {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .group {
  display: flex;
  flex-direction: column;
 }
</style>
