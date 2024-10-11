<script>
 import Button from '../../../core/components/button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalAddEdit from '../modals/addressbook-add-edit.svelte';
 import ModalDel from '../modals/addressbook-del.svelte';
 import Icon from '../components/table-icon.svelte';
 import { addressBook } from '../wallet.ts';
 let showModalAddEdit = false;
 let showModalDel = false;
 let edit = false;
 let modalItem = null;

 function addToAddressBookModal() {
  modalItem = null;
  edit = false;
  showModalAddEdit = true;
 }

 function editItemModal(item) {
  console.log('EDIT ADDRESSBOOK ITEM:', item);
  modalItem = item;
  edit = true;
  showModalAddEdit = true;
 }

 function deleteItemModal(item) {
  console.log('DELETE ADDRESSBOOK ITEM:', item);
  modalItem = item;
  showModalDel = true;
 }
</script>

<style>
 .addressbook {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .buttons {
  display: flex;
 }

 table {
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 th,
 td {
  padding: 5px;
 }

 th {
  text-align: left;
  background-color: #222;
  color: #fff;
 }

 th.center,
 td.center {
  display: flex;
  justify-content: center;
  align-items: center;
 }

 .item {
  padding: 5px;
 }

 .item.even {
  background-color: #ffa;
 }

 .item.odd {
  background-color: #ffd;
 }

 .item:hover {
  background-color: #fd1;
 }

 .icons {
  display: flex;
 }
</style>

<div class="addressbook">
 <div class="buttons">
  <Button text="Add an address" on:click={addToAddressBookModal} />
 </div>
 {#if $addressBook.length > 0}
  <table>
   <tr>
    <th>Alias</th>
    <th>Address</th>
    <th class="center">Action</th>
   </tr>
   {#each $addressBook as a, index (index + '/' + a.address)}
    <tr class="item {index % 2 === 0 ? 'even' : 'odd'}">
     <td>{a.alias}</td>
     <td>{a.address}</td>
     <td class="center">
      <div class="icons">
       <Icon icon="img/edit.svg" title="Edit" on:click={() => editItemModal(a)} />
       <Icon icon="img/del.svg" title="Delete" on:click={() => deleteItemModal(a)} />
      </div>
     </td>
    </tr>
   {/each}
  </table>
 {/if}
</div>
<Modal title={edit ? 'Edit the item in address book' : 'Add a new item to address book'} body={ModalAddEdit} params={{ item: modalItem }} bind:show={showModalAddEdit} />
<Modal title="Delete the item in address book" body={ModalDel} params={{ item: modalItem }} bind:show={showModalDel} />
