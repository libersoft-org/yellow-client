<script>
 import { accounts_config, hideSidebarMobile } from '../core.js';
 import Button from '../components/button.svelte';
 import ActionItem from '../components/accounts-action-item.svelte';
 import Modal from '../components/modal.svelte';
 import ModalAccountsAddEdit from '../modals/modal-accounts-add-edit.svelte';
 import ModalAccountsDel from '../modals/modal-accounts-del.svelte';
 let isAddEditAccountModalOpen = false;
 let isDelAccountModalOpen = false;
 let idItem = null;
 let accountTitle = '';

 function back() {
  hideSidebarMobile.set(false);
  // TODO: switch back to welcome screen
 }

 function addAccountModal() {
  idItem = null;
  isAddEditAccountModalOpen = true;
 }

 function clickEdit(id) {
  idItem = id;
  isEditAccountModalOpen = true;
 }

 function clickDel(id, title) {
  idItem = id;
  accountTitle = title;
  isDelAccountModalOpen = true;
 }
</script>

<style>
 .accounts {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  height: calc(100vh - 20px);
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }
 
 .table {
  display: inline-block;
 }

 table {
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 thead tr {
  background-color: #222;
  color: #fff;
  text-align: left;
 }

 tbody tr:nth-child(even) {
  background-color: #ffdd1130;
 }

 tbody tr:nth-child(odd) {
  background-color: #ffdd1150;
 }

 tbody tr:hover {
  background-color: #fd1;
 }

 thead th, tbody td {
  padding: 10px;
 }

 thead th {
  background-color: #222;
  color: #fff;
  text-align: left;
 }

 thead th.center, tbody td.center {
  text-align: center;
 }

 .action-items {
  display: flex;
 }

 .accounts .buttons {
  display: flex;
  gap: 10px;
 }
</style>

<div class="accounts">
 // TODO: back() should switch content back to welcome screen<br />
 <div class="buttons">
  <Button img="img/back.svg" text="Back" on:click={back} hiddenOnDesktop={true} />
  <Button img="img/accounts-black.svg" text="Add a new account" on:click={addAccountModal} />
 </div>
 <div class="table">
  <table>
   <thead>
    <th class="center">Account ID</th>
    <th class="center">Title</th>
    <th class="center">Server</th>
    <th class="center">Address</th>
    <th class="center">Enabled</th>
    <th class="center">Action</th>
   </thead>
   <tbody>
    {#each $accounts_config as a (a.id)}
     <tr>
      <td class="center">{a.id}</td>
      <td class="center">{a.title}</td>
      <td class="center">{a.credentials.server}</td>
      <td class="center">{a.credentials.address}</td>
      <td class="center">{a.enabled ? 'Yes' : 'No'}</td>
      <td class="center">
       <div class="action-items">
        <ActionItem img="img/edit.svg" title="Edit" on:click={() => clickEdit(a.id)} />
        <ActionItem img="img/del.svg" title="Delete" on:click={() => clickDel(a.id, a.title)} />
       </div>
      </td>
     </tr>
    {/each}
   </tbody>
  </table>
 </div>
</div>
{#if isAddEditAccountModalOpen}
 <Modal title="Add a new account" onClose={() => isAddEditAccountModalOpen = false}>
  <ModalAccountsAddEdit onClose={() => isAddEditAccountModalOpen = false} />
 </Modal>
{/if}
{#if isDelAccountModalOpen}
 <Modal title="Delete the account" onClose={() => isDelAccountModalOpen = false}>
  <ModalAccountsDel id={idItem} title={accountTitle} onClose={() => isDelAccountModalOpen = false} />
 </Modal>
{/if}