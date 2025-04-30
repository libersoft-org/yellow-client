<script>
 import { accounts_config, debug, findAccount, hideSidebarMobile, selected_corepage_id } from '../../core.js';
 import Button from '@/core/components/Button/Button.svelte';
 import TableActionItems from '../../components/Table/TableActionItems.svelte';
 import Icon from '../../components/Icon/Icon.svelte';
 import Table from '../../components/Table/Table.svelte';
 import TableTHead from '../../components/Table/TableTHead.svelte';
 import TableTHeadTr from '../../components/Table/TableTHeadTr.svelte';
 import TableTHeadTh from '../../components/Table/TableTHeadTh.svelte';
 import TableTBody from '../../components/Table/TableTBody.svelte';
 import TableTBodyTr from '../../components/Table/TableTBodyTr.svelte';
 import TableTBodyTd from '../../components/Table/TableTBodyTd.svelte';
 import Modal from '../../components/Modal/Modal.svelte';
 import ModalAccountsAddEdit from '@/core/modals/AccountsAddEdit.svelte';
 import ModalAccountsDelete from '@/core/modals/AccountsDelete.svelte';
 import AccountsExport from '@/core/modals/AccountsExport.svelte';
 import AccountsImport from '@/core/modals/AccountsImport.svelte';
 import AccountStatusIconIconAndText from '@/core/components/Account/AccountStatusIconIconAndText.svelte';
 import { m } from '@/lib/paraglide/messages.js';

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

 .accounts .buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
 }
</style>

<div class="accounts">
 <div class="buttons">
  <Button img="img/back.svg" text={m['core.common.back']()} onClick={back} hiddenOnDesktop={true} />
  <Button img="img/accounts.svg" text={m['core.accounts_content.add_new_account']()} colorVariable="--icon-black" onClick={addAccountModal} />
  <Button text="Export" onClick={clickExport} />
  <Button text="Import" onClick={clickImport} />
 </div>
 <Table>
  <TableTHead>
   <TableTHeadTr>
    <TableTHeadTh center={true}>{m['core.accounts_content.status']()}</TableTHeadTh>
    <TableTHeadTh center={true}>{m['core.accounts_content.title']()}</TableTHeadTh>
    <TableTHeadTh center={true}>{m['core.accounts_content.server']()}</TableTHeadTh>
    <TableTHeadTh center={true}>{m['core.accounts_content.address']()}</TableTHeadTh>
    <TableTHeadTh center={true}>{m['core.accounts_content.enabled']()}</TableTHeadTh>
    <TableTHeadTh center={true}>{m['core.accounts_content.action']()}</TableTHeadTh>
    {#if $debug}
     <TableTHeadTh center={true}>Account ID</TableTHeadTh>
    {/if}
   </TableTHeadTr>
  </TableTHead>
  <TableTBody>
   {#each $accounts_config as a (a.id)}
    <TableTBodyTr>
     <TableTBodyTd center={true}>
      <AccountStatusIconIconAndText account={findAccount(a.id)} />
     </TableTBodyTd>
     <TableTBodyTd center={true}>{a.settings?.title}</TableTBodyTd>
     <TableTBodyTd center={true}>{a.credentials.server}</TableTBodyTd>
     <TableTBodyTd center={true}>{a.credentials.address}</TableTBodyTd>
     <TableTBodyTd center={true}>{a.enabled ? 'Yes' : 'No'}</TableTBodyTd>
     <TableTBodyTd center={true}>
      <TableActionItems>
       <Icon img="img/edit.svg" alt={m['core.common.edit']()} colorVariable="--icon-blue" size={20} padding={5} onClick={() => clickEdit(a.id)} />
       <Icon img="img/del.svg" alt={m['core.common.delete']()} colorVariable="--icon-red" size={20} padding={5} onClick={() => clickDel(a.id, a.settings?.title)} />
      </TableActionItems>
     </TableTBodyTd>
     {#if $debug}
      <TableTBodyTd class="center">{a.id}</TableTBodyTd>
     {/if}
    </TableTBodyTr>
   {/each}
  </TableTBody>
 </Table>
</div>
<Modal title={idItem === null ? m['core.accounts_content.add_new_account']() : m['core.accounts_content.edit_account']()} body={ModalAccountsAddEdit} params={{ id: idItem }} bind:show={showAddEditAccountModal} />
<Modal title={m['core.accounts_content.delete_account']()} body={ModalAccountsDelete} params={{ id: idItem, name: accountTitle }} bind:show={showDelAccountModal} />
<Modal title={m['core.accounts_content.export_accounts']()} body={AccountsExport} bind:show={showExportModal} />
<Modal title={m['core.accounts_content.import_accounts']()} body={AccountsImport} bind:show={showImportModal} />
