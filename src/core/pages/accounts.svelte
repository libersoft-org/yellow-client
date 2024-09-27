<script>
 import { accounts_config, hideSidebarMobile } from '../core.js';
 import Button from '../components/button.svelte';
 import ActionItem from '../components/accounts-action-item.svelte';
 import Modal from '../components/modal.svelte';
 import ModalAccountsAdd from '../modals/modal-accounts-add.svelte';
 let isAddAccountModalOpen = false;

 function back() {
  hideSidebarMobile.set(false);
  // TODO: switch back to welcome screen
 }

 function addAccountModal() {
  isAddAccountModalOpen = true;
 }

 function clickEdit(id) {
  console.log('EDIT', id);
 }

 function clickDel(id) {
  console.log('DEL', id);
 }
</script>

<style>
 .accounts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  height: calc(100% - 20px);
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }

 .accounts table {
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }

 .accounts table thead tr {
  background-color: #222;
  color: #fff;
  text-align: left;
 }

 .accounts table tbody tr:nth-child(even) {
  background-color: #ffdd1130;
 }

 .accounts table tbody tr:nth-child(odd) {
  background-color: #ffdd1150;
 }

 .accounts table tbody tr:hover {
  background-color: #fd1;
 }

 .accounts table tbody td {
  padding: 10px;
 }

 .action-items {
  display: flex;
 }

 .accounts .buttons {
  display: flex;
  gap: 10px;
 }
</style>

// TODO: copy table header style from admin<br />
// TODO: fix table align (the same as in admin)<br />
// TODO: back() should switch content back to welcome screen
// TODO: back button should be visible only on mobile platform<br />

<div class="accounts">
 <div class="buttons">
  <Button img="img/back.svg" text="Back" on:click={back} />
  <Button img="img/accounts-black.svg" text="Add a new account" on:click={addAccountModal} />
 </div>
 <table>
  <thead>
   <th>Account ID</th>
   <th>Title</th>
   <th>Server</th>
   <th>Address</th>
   <th>Enabled</th>
   <th>Action</th>
  </thead>
  <tbody>
   {#each $accounts_config as a (a.id)}
    <tr>
     <td>{a.id}</td>
     <td>{a.title}</td>
     <td>{a.credentials.server}</td>
     <td>{a.credentials.address}</td>
     <td>{a.enabled ? 'Yes' : 'No'}</td>
     <td>
      <div class="action-items">
       <ActionItem img="img/edit.svg" title="Edit" on:click={() => clickEdit(a.id)} />
       <ActionItem img="img/del.svg" title="Delete" on:click={() => clickDel(a.id)} />
      </div>
     </td>
    </tr>
   {/each}
  </tbody>
 </table>
</div>
{#if isAddAccountModalOpen}
<Modal title="Add a new account" onClose={() => isAddAccountModalOpen = false}>
 <ModalAccountsAdd onClose={() => isAddAccountModalOpen = false} />
</Modal>
{/if}