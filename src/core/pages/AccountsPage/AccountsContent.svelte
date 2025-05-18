<script>
 import { debug, findAccount, selected_corepage_id, accounts_config, hideSidebarMobile } from '../../core.js';
 import ButtonBar from '../../components/Button/ButtonBar.svelte';
 import Button from '../../components/Button/Button.svelte';
 import TableActionItems from '../../components/Table/TableActionItems.svelte';
 import Icon from '../../components/Icon/Icon.svelte';
 import Table from '../../components/Table/Table.svelte';
 import Thead from '../../components/Table/TableThead.svelte';
 import TheadTr from '../../components/Table/TableTheadTr.svelte';
 import Th from '../../components/Table/TableTheadTh.svelte';
 import Tbody from '../../components/Table/TableTbody.svelte';
 import TbodyTr from '../../components/Table/TableTbodyTr.svelte';
 import Td from '../../components/Table/TableTbodyTd.svelte';
 import Modal from '../../components/Modal/Modal.svelte';
 import ModalAccountsAddEdit from '@/core/modals/AccountsAddEdit.svelte';
 import ModalAccountsDelete from '@/core/modals/AccountsDelete.svelte';
 import AccountsExport from '@/core/modals/AccountsExport.svelte';
 import AccountsImport from '@/core/modals/AccountsImport.svelte';
 import AccountStatusIconIconAndText from '@/core/components/Account/AccountStatusIconIconAndText.svelte';
 let showAddEditAccountModal = false;
 let showDelAccountModal = false;
 let showExportModal = false;
 let showImportModal = false;
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

 function clickExport() {
  showExportModal = true;
 }

 function clickImport() {
  showImportModal = true;
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
</style>

<div class="accounts">
 <ButtonBar>
  <Button img="img/back.svg" text="Back" onClick={back} hiddenOnDesktop={true} />
  <Button img="img/accounts.svg" text="Add a new account" colorVariable="--icon-black" onClick={addAccountModal} />
  <Button img="img/export.svg" text="Export" onClick={clickExport} />
  <Button img="img/import.svg" text="Import" onClick={clickImport} />
 </ButtonBar>
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
      <Td center={true}><AccountStatusIconIconAndText account={findAccount(a.id)} /></Td>
      <Td center={true}>{a.settings?.title}</Td>
      <Td center={true}>{a.credentials.server}</Td>
      <Td center={true}>{a.credentials.address}</Td>
      <Td center={true}>{a.enabled ? 'Yes' : 'No'}</Td>
      <Td center={true}>
       <TableActionItems>
        <Icon img="img/edit.svg" alt="Edit" colorVariable="--icon-blue" size="20" padding="5" onClick={() => clickEdit(a.id)} />
        <Icon img="img/del.svg" alt="Delete" colorVariable="--icon-red" size="20" padding="5" onClick={() => clickDel(a.id, a.settings?.title)} />
       </TableActionItems>
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
<Modal title={idItem === null ? 'Add a new account' : 'Edit account'} body={ModalAccountsAddEdit} params={{ id: idItem }} bind:show={showAddEditAccountModal} />
<Modal title="Delete the account" body={ModalAccountsDelete} params={{ id: idItem, name: accountTitle }} bind:show={showDelAccountModal} />
<Modal title="Export all accounts" body={AccountsExport} bind:show={showExportModal} />
<Modal title="Import accounts" body={AccountsImport} bind:show={showImportModal} />
