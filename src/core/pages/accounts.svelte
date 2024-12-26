<script>
 import { debug, findAccount, selected_corepage_id, accounts_config, accounts, hideSidebarMobile } from '../core.js';
 import Button from '../components/button.svelte';
 import ActionItem from '../components/icon.svelte';
 import Modal from '../components/modal.svelte';
 import ModalAccountsAddEdit from '../modals/accounts-add-edit.svelte';
 import ModalAccountsDel from '../modals/accounts-del.svelte';
 import { get } from 'svelte/store';
 import AccountStatusIconAndText from './AccountStatusIconAndText.svelte';
 let showAddEditAccountModal = false;
 let showDelAccountModal = false;
 let idItem = null;
 let accountTitle = '';

 function back() {
  hideSidebarMobile.set(false);
  selected_corepage_id.set(null);
 }

 function addAccountModal() {
  idItem = null;
  showAddEditAccountModal = true;
 }

 function clickEdit(id) {
  idItem = id;
  showAddEditAccountModal = true;
 }

 function clickDel(id, title) {
  idItem = id;
  accountTitle = title;
  showDelAccountModal = true;
 }

 function accountsConfigExport() {
  window.alert(JSON.stringify(get(accounts_config), null, 2));
  console.log(JSON.stringify(get(accounts).map(get), null, 2));
 }

 function accountsConfigImport() {
  let text = window.prompt('Paste the exported JSON here:', '');
  if (text) {
   let data = JSON.parse(text);
   accounts_config.set(data);
  }
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

 thead th,
 tbody td {
  padding: 10px;
 }

 thead th {
  background-color: #222;
  color: #fff;
  text-align: left;
 }

 thead th.center,
 tbody td.center {
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
 <div class="buttons">
  <Button img="img/back.svg" text="Back" on:click={back} hiddenOnDesktop={true} />
  <Button img="img/accounts-black.svg" text="Add a new account" on:click={addAccountModal} />
  <Button text="Export" on:click={accountsConfigExport} />
  <Button text="Import" on:click={accountsConfigImport} />
 </div>
 <div class="table">
  <table>
   <thead>
    <tr>
     <th class="center">Status</th>
     <th class="center">Title</th>
     <th class="center">Server</th>
     <th class="center">Address</th>
     <th class="center">Enabled</th>
     <th class="center">Action</th>
     {#if $debug}
      <th class="center">Account ID</th>
     {/if}
    </tr>
   </thead>
   <tbody>
    {#each $accounts_config as a (a.id)}
     <tr>
      <td class="center"><AccountStatusIconAndText account={findAccount(a.id)} /></td>
      <td class="center">{a.settings?.title}</td>
      <td class="center">{a.credentials.server}</td>
      <td class="center">{a.credentials.address}</td>
      <td class="center">{a.enabled ? 'Yes' : 'No'}</td>
      <td class="center">
       <div class="action-items">
        <ActionItem img="img/edit.svg" alt="Edit" size="20" padding="5" onClick={() => clickEdit(a.id)} />
        <ActionItem img="img/del.svg" alt="Delete" size="20" padding="5" onClick={() => clickDel(a.id, a.settings?.title)} />
       </div>
      </td>
      {#if $debug}
       <td class="center">{a.id}</td>
      {/if}
     </tr>
    {/each}
   </tbody>
  </table>
 </div>
</div>
<Modal title="Add a new account" body={ModalAccountsAddEdit} params={{ id: idItem }} bind:show={showAddEditAccountModal} />
<Modal title="Delete the account" body={ModalAccountsDel} params={{ id: idItem, name: accountTitle }} bind:show={showDelAccountModal} />
