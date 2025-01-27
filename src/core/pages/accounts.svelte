<script>
 import { debug, findAccount, selected_corepage_id, accounts_config, accounts, hideSidebarMobile } from '../core.js';
 import Button from '../components/button.svelte';
 import ActionItems from '../components/table-actionitems.svelte';
 import Item from '../components/icon.svelte';
 import Table from '../components/table.svelte';
 import Thead from '../components/table-thead.svelte';
 import TheadTr from '../components/table-thead-tr.svelte';
 import Th from '../components/table-thead-th.svelte';
 import Tbody from '../components/table-tbody.svelte';
 import TbodyTr from '../components/table-tbody-tr.svelte';
 import Td from '../components/table-tbody-td.svelte';
 import Modal from '../components/modal.svelte';
 import ModalAccountsAddEdit from '../modals/accounts-add-edit.svelte';
 import ModalAccountsDel from '../modals/accounts-del.svelte';
 import { get } from 'svelte/store';
 import AccountStatusIconAndText from '../components/account-status-icon-and-text.svelte';
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

 .accounts .buttons {
  display: flex;
  gap: 10px;
 }
</style>

<div class="accounts">
 <div class="buttons">
  <Button img="img/back.svg" text="Back" onClick={back} hiddenOnDesktop={true} />
  <Button img="img/accounts-black.svg" text="Add a new account" onClick={addAccountModal} />
  <Button text="Export" onClick={accountsConfigExport} />
  <Button text="Import" onClick={accountsConfigImport} />
 </div>
 <div class="table">
  <Table>
   <Thead>
    <TheadTr>
     <Th center={true}>Status</Th>
     <Th center={true}>Title</Th>
     <Th center={true}>Server</Th>
     <Th center={true}>Address</Th>
     <Th center={true}>Enabled</Th>
     <Th center={true}>Action</Th>
     {#if $debug}
      <Th center={true}>Account ID</Th>
     {/if}
    </TheadTr>
   </Thead>
   <Tbody>
    {#each $accounts_config as a (a.id)}
     <TbodyTr>
      <Td center={true}><AccountStatusIconAndText account={findAccount(a.id)} /></Td>
      <Td center={true}>{a.settings?.title}</Td>
      <Td center={true}>{a.credentials.server}</Td>
      <Td center={true}>{a.credentials.address}</Td>
      <Td center={true}>{a.enabled ? 'Yes' : 'No'}</Td>
      <Td center={true}>
       <ActionItems>
        <Item img="img/edit.svg" alt="Edit" size="20" padding="5" onClick={() => clickEdit(a.id)} />
        <Item img="img/del.svg" alt="Delete" size="20" padding="5" onClick={() => clickDel(a.id, a.settings?.title)} />
       </ActionItems>
      </Td>
      {#if $debug}
       <Td class="center">{a.id}</Td>
      {/if}
     </TbodyTr>
    {/each}
   </Tbody>
  </Table>
 </div>
</div>
<Modal title="Add a new account" body={ModalAccountsAddEdit} params={{ id: idItem }} bind:show={showAddEditAccountModal} />
<Modal title="Delete the account" body={ModalAccountsDel} params={{ id: idItem, name: accountTitle }} bind:show={showDelAccountModal} />
