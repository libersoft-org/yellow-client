<script>
 import { onMount } from 'svelte';
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 import { addressBook } from '../wallet';
 export let close;
 export let params;
 let aliasElement;
 let alias = '';
 let address = '';
 let error = '';

 onMount(() => {
  if (params.item) {
   alias = params.item.alias;
   address = params.item.address;
  }
  aliasElement.focus();
 });

 function findAddressBookItemByAddress(address) {
  const ab = $addressBook;
  return ab.find(i => i.address === address);
 }

 function findAddressBookItemById(id) {
  const ab = $addressBook;
  return ab.find(i => i.guid === id);
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
  close();
 }

 function edit() {
  let dupe = findAddressBookItemByAddress(address);
  if (dupe && dupe.guid != params.item.guid) {
   error = 'Address already exists in the address book, see alias: "' + dupe.alias + '"';
   return;
  }
  params.item.alias = alias;
  params.item.address = address;
  addressBook.set($addressBook);
  close();
 }

 function keyEnter() {
  if (event.key === 'Enter') {
   event.preventDefault();
   add();
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
  <InputText placeholder="Alias" bind:value={alias} bind:this={aliasElement} onKeydown={keyEnter} />
 </div>
 <div class="group">
  <div class="bold">Address:</div>
  <InputText placeholder="Address" bind:value={address} onKeydown={keyEnter} />
 </div>
 {#if error}
  <div class="error">
   <div class="bold">Error:</div>
   <div>{error}</div>
  </div>
 {/if}
 {#if params.item}
  <Button text="Save" onClick={edit} />
 {:else}
  <Button text="Add" onClick={add} />
 {/if}
</div>
