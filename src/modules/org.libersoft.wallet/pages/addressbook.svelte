<script>
 import Button from '../../../core/components/button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalAddEdit from '../modals/addressbook-add-edit.svelte';
 import ModalDel from '../modals/addressbook-del.svelte';
 import Icon from '../../../core/components/icon.svelte';
 import { addressBook } from '../wallet.ts';
 import { get } from 'svelte/store';
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

 function exportAddressBook() {
  console.log('EXPORT ADDRESSBOOK');
  let data = get(addressBook);
  let json = JSON.stringify(data, null, 2);
  console.log('EXPORTED ADDRESSBOOK:', json);
  window.prompt('Copy the exported address book:', json);
 }

 function importAddressBook() {
  console.log('IMPORT ADDRESSBOOK');
  let json = window.prompt('Paste the exported address book here:');
  if (json) {
   try {
    let data = JSON.parse(json);
    console.log('IMPORTED ADDRESSBOOK:', data);
    addressBook.set(data);
   } catch (e) {
    console.error('IMPORT ADDRESSBOOK ERROR:', e);
   }
  }
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
  gap: 10px;
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
  <Button text="Add an address" onClick={addToAddressBookModal} />
  <Button text="Export" onClick={exportAddressBook} />
  <Button text="Import" onClick={importAddressBook} />
 </div>
 {#if $addressBook.length > 0}
  <table>
   <thead>
    <tr>
     <th>Alias</th>
     <th>Address</th>
     <th class="center">Action</th>
    </tr>
   </thead>
   <tbody>
    {#each $addressBook as a, index (index + '/' + a.address)}
     <tr class="item {index % 2 === 0 ? 'even' : 'odd'}">
      <td>{a.alias}</td>
      <td>{a.address}</td>
      <td class="center">
       <div class="icons">
        <Icon img="img/edit.svg" alt="Edit" size="20" padding="5" onClick={() => editItemModal(a)} />
        <Icon img="img/del.svg" alt="Delete" size="20" padding="5" onClick={() => deleteItemModal(a)} />
       </div>
      </td>
     </tr>
    {/each}
   </tbody>
  </table>
 {/if}
</div>
<Modal title={edit ? 'Edit the item in address book' : 'Add a new item to address book'} body={ModalAddEdit} params={{ item: modalItem }} bind:show={showModalAddEdit} />
<Modal title="Delete the item in address book" body={ModalDel} params={{ item: modalItem }} bind:show={showModalDel} />
