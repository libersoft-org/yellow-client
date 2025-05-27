<script lang="ts">
 import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import Table from '@/core/components/ResponsiveTable/Table.svelte';
 import THead from '@/core/components/ResponsiveTable/THead.svelte';
 import THeadTr from '@/core/components/ResponsiveTable/THeadTr.svelte';
 import THeadTh from '@/core/components/ResponsiveTable/THeadTh.svelte';
 import TBody from '@/core/components/ResponsiveTable/TBody.svelte';
 import TBodyTr from '@/core/components/ResponsiveTable/TBodyTr.svelte';
 import TBodyTd from '@/core/components/ResponsiveTable/TBodyTd.svelte';
 import TableActionItems from '@/core/components/ResponsiveTable/TableActionItems.svelte';

 import Modal from '@/core/components/Modal/Modal.svelte';
 import ModalAddEdit from '../../modals/addressbook-add-edit.svelte';
 import ModalDel from '../../modals/addressbook-del.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import { module } from '../../module.js';
 import { addressBook } from '../../wallet.ts';
 import { get } from 'svelte/store';

 let showModalAddEdit = $state(false);
 let showModalDel = $state(false);
 let edit = $state(false);
 let modalItem = $state(null);

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
</style>

<div class="addressbook">
 <ButtonBar>
  <Button img="modules/{module.identifier}/img/address-add.svg" text="Add an address" onClick={addToAddressBookModal} />
  <Button img="img/export.svg" text="Export" onClick={exportAddressBook} />
  <Button img="img/import.svg" text="Import" onClick={importAddressBook} />
 </ButtonBar>
 {#if $addressBook.length > 0}
  <Table breakpoint="0">
   <THead>
    <THeadTr>
     <THeadTh>Alias</THeadTh>
     <THeadTh>Address</THeadTh>
     <THeadTh>Action</THeadTh>
    </THeadTr>
   </THead>
   <TBody>
    {#each $addressBook as a, index (index + '/' + a.address)}
     <TBodyTr>
      <TBodyTd title="Alias">
       <b>{a.alias}</b>
      </TBodyTd>
      <TBodyTd title="Address">
       {a.address}
      </TBodyTd>
      <TBodyTd title="Action">
       <TableActionItems>
        <Icon img="img/edit.svg" alt="Edit" colorVariable="--icon-blue" size="20px" padding="5px" onClick={() => editItemModal(a)} />
        <Icon img="img/del.svg" alt="Delete" colorVariable="--icon-red" size="20px" padding="5px" onClick={() => deleteItemModal(a)} />
       </TableActionItems>
      </TBodyTd>
     </TBodyTr>
    {/each}
   </TBody>
  </Table>
 {/if}
</div>

<Modal title={edit ? 'Edit the item in address book' : 'Add a new item to address book'} body={ModalAddEdit} params={{ item: modalItem }} bind:show={showModalAddEdit} width="400px" />
<Modal title="Delete the item in address book" body={ModalDel} params={{ item: modalItem }} bind:show={showModalDel} width="400px" />
