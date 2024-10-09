<script>
 import { onMount } from 'svelte';
 import Button from '../../../core/components/button.svelte';
 import { addressBook } from '../wallet.ts';
 export let onClose;
 let aliasElement;
 let alias = '';
 let address = '';
 let error = '';

 onMount(() => aliasElement.focus());

 function addToAddressBook() {
  if (alias) alias = alias.trim();
  if (address) address = address.trim();
  console.log(alias, address);
  if (!alias || alias === '') {
   error = 'Alias is not filled';
   return;
  }
  if (!address || address === '') {
   error = 'Address is not filled';
   return;
  }
  console.log('NEW ITEM IN ADDRESS BOOK:', alias, address);
  $addressBook.push({ alias, address });
  addressBook.set($addressBook);
  onClose();
 }

 function keyEnter() {
  if (event.key === 'Enter') {
   event.preventDefault();
   addToAddressBook();
  }
 }
</script>

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

 .error {
  display: flex;
  gap: 5px;
  padding: 10px;
  border: 1px solid #f00;
  border-radius: 10px;
  background-color: #faa;
 }
</style>

<div class="addressbook-new">
 <div class="group">
  <div class="bold">Alias:</div>
  <input type="text" placeholder="Alias" bind:value={alias} bind:this={aliasElement} on:keydown={keyEnter} />
 </div>
 <div class="group">
  <div class="bold">Address:</div>
  <input type="text" placeholder="Address" bind:value={address} on:keydown={keyEnter} />
 </div>
 {#if error}
  <div class="error">
   <div class="bold">Error:</div>
   <div>{error}</div>
  </div>
 {/if}
 <Button text="Add" on:click={addToAddressBook} />
</div>
