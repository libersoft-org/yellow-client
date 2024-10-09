<script>
 import { onMount } from 'svelte';
 import Button from '../../../core/components/button.svelte';
 import { addressBook } from '../wallet';
 import { get } from 'svelte/store';
 export let onClose;
 export let item = null;
 let aliasElement;
 let alias = '';
 let address = '';
 let error = '';

 onMount(() => {
  if (item) {
   alias = item.alias;
   address = item.address;
  }
  aliasElement.focus();
 });

 function findAddressBookItemByAddress(address) {
  const ab = get(addressBook);
  return ab.find(item => item.address === address);
 }

 function add() {
  if (alias) alias = alias.trim();
  if (address) address = address.trim();
  console.log(alias, address);
  if (!alias || alias === '') {
   error = 'Alias is not set';
   return;
  }
  if (!address || address === '') {
   error = 'Address is not set';
   return;
  }
  let dupe = findAddressBookItemByAddress(address);
  if (dupe) {
   error = 'Address already exists in the address book, see alias: "' + dupe.alias + '"';
   return;
  }
  console.log('NEW ITEM IN ADDRESS BOOK:', alias, address);
  $addressBook.push({ alias, address });
  addressBook.set($addressBook);
  onClose();
 }

 function edit() {
  let dupe = findAddressBookItemByAddress(address);
  if (dupe && dupe != item) {
   error = 'Address already exists in the address book, see alias: "' + dupe.alias + '"';
   return;
  }
  item.alias = alias;
  item.address = address;
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
 {#if item}
  <Button text="Save" on:click={edit} />
 {:else}
  <Button text="Add" on:click={add} />
 {/if}
</div>
