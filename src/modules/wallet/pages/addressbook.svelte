<script>
 import Button from '../../../core/components/button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalNew from '../modals/addressbook-new.svelte';
 import { addressBook } from '../wallet.ts';
 let isModalNewOpen = false;
 
 function addToAddressBookModal() {
  isModalNewOpen = true;
 }
</script>

<style>
 .addressbook {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .items {
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 .items .item {
  display: flex;
  gap: 5px;
  padding: 5px;
 }

 .items .item.even {
  background-color: #ffa;
 }

 .items .item.odd {
  background-color: #ffd;
 }

 .items .item:hover {
  background-color: #fd1;
 }
</style>

<div class="addressbook">
 <Button text="Add to address book" on:click={addToAddressBookModal} />
  {#if $addressBook.length > 0}
   <div class="items">
   {#each $addressBook as a, index}
   <div class="item {index % 2 === 0 ? 'even' : 'odd'}">
    <div>{a.alias}</div>
    <div>{a.address}</div>
   </div>
   {/each}
  </div>
 {/if}
</div>
{#if isModalNewOpen}
 <Modal title="Add a new address to address book" onClose={() => isModalNewOpen = false}>
  <ModalNew onClose={() => isModalNewOpen = false} />
 </Modal>
{/if}
