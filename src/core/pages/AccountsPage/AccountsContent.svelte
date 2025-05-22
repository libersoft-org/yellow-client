<script lang="ts">
 import { debug, findAccount, selected_corepage_id, accounts_config, hideSidebarMobile } from '../../core.js';
 import Button from '@/core/components/Button/Button.svelte';
 import TableActionItems from '../../components/Table/TableActionItems.svelte';
 import Icon from '../../components/Icon/Icon.svelte';
 import ResponsiveTable from '../../components/ResponsiveTable/Table.svelte';
 import ResponsiveTableTHead from '../../components/ResponsiveTable/TableTHead.svelte';
 import ResponsiveTableTHeadTr from '../../components/ResponsiveTable/TableTHeadTr.svelte';
 import ResponsiveTableTHeadTh from '../../components/ResponsiveTable/TableTHeadTh.svelte';
 import ResponsiveTableTBody from '../../components/ResponsiveTable/TableTBody.svelte';
 import ResponsiveTableTBodyTr from '../../components/ResponsiveTable/TableTBodyTr.svelte';
 import ResponsiveTableTBodyTd from '../../components/ResponsiveTable/TableTBodyTd.svelte';
 import Modal from '../../components/Modal/Modal.svelte';
 import ModalAccountsAddEdit from '@/core/modals/AccountsAddEdit.svelte';
 import ModalAccountsDelete from '@/core/modals/AccountsDelete.svelte';
 import AccountsExport from '@/core/modals/AccountsExport.svelte';
 import AccountsImport from '@/core/modals/AccountsImport.svelte';
 import Accordion from '@/core/components/Accordion/Accordion.svelte';
 import Paper from '@/core/components/Paper/Paper.svelte';
 import TopBar from '@/core/components/TopBar/TopBar.svelte';
 import AccountStatusIconIconAndText from '@/core/components/Account/AccountStatusIconIconAndText.svelte';

 type Props = {
  showAddEditAccountModal: boolean;
  showDelAccountModal: boolean;
  showExportModal: boolean;
  showImportModal: boolean;
  idItem: string | null;
  accountTitle: string;
 };

 let { showAddEditAccountModal = $bindable(false), showDelAccountModal = false, showExportModal = $bindable(false), showImportModal = $bindable(false), idItem = $bindable(null), accountTitle = $bindable('') }: Props = $props();

 function back() {
  hideSidebarMobile.set(false);
  selected_corepage_id.set(null);
 }

 function addAccountModal() {
  idItem = null;
  showAddEditAccountModal = true;
 }

 function clickEdit(id: string) {
  idItem = id;
  showAddEditAccountModal = true;
 }

 const clickDel = (id: string, title: string) => {
  idItem = id;
  accountTitle = title;
  showDelAccountModal = true;
 };

 function clickExport() {
  showExportModal = true;
 }

 function clickImport() {
  showImportModal = true;
 }
</script>

<style>
 .accounts {
  background: url('/img/background.webp') repeat;
  background-size: 400px;

  .accounts-wrapper {
   display: flex;
   flex-direction: column;
   gap: clamp(16px, 1.6vw, 24px);
   padding: clamp(16px, 1.6vw, 24px);
   height: 100dvh;
  }
 }

 .buttons {
  display: flex;
  gap: clamp(8px, 0.8vw, 12px);
  flex-wrap: wrap;

  @media only screen and (max-width: 32em) {
   justify-content: flex-start;
  }
 }

 :global(.button) {
  white-space: nowrap;
 }
</style>

{#snippet accountTable(account)}
 <ResponsiveTable>
  <ResponsiveTableTHead>
   <ResponsiveTableTHeadTr>
    <ResponsiveTableTHeadTh>Server</ResponsiveTableTHeadTh>
    <ResponsiveTableTHeadTh>Address</ResponsiveTableTHeadTh>
    <ResponsiveTableTHeadTh>Enabled</ResponsiveTableTHeadTh>
    <ResponsiveTableTHeadTh>Action</ResponsiveTableTHeadTh>
   </ResponsiveTableTHeadTr>
  </ResponsiveTableTHead>
  <ResponsiveTableTBody>
   <ResponsiveTableTBodyTr>
    <ResponsiveTableTBodyTd title="Server">{account.credentials.server}</ResponsiveTableTBodyTd>
    <ResponsiveTableTBodyTd title="Address">{account.credentials.address}</ResponsiveTableTBodyTd>
    <ResponsiveTableTBodyTd title="Enabled">{account.enabled ? 'Yes' : 'No'}</ResponsiveTableTBodyTd>
    <ResponsiveTableTBodyTd title="Action">
     <TableActionItems>
      <Icon img="img/edit.svg" alt="Edit" colorVariable="--icon-blue" size="20px" padding="5px" onClick={() => clickEdit(account.id)} />
      <Icon img="img/del.svg" alt="Delete" colorVariable="--icon-red" size="20px" padding="5px" onClick={() => clickDel(account.id, account.settings?.title)} />
     </TableActionItems>
    </ResponsiveTableTBodyTd>
   </ResponsiveTableTBodyTr>
  </ResponsiveTableTBody>
 </ResponsiveTable>
{/snippet}

{#snippet status(account)}
 <div class="optional-data">
  <AccountStatusIconIconAndText account={findAccount(account.id)} />
 </div>
{/snippet}

<div class="accounts">
 <TopBar>
  <svelte:fragment slot="left">
   <Icon img="img/back.svg" onClick={back} colorVariable="--icon-white" visibleOnDesktop={false} />
   <h1 class="title">Account management</h1>
  </svelte:fragment>
 </TopBar>
 <div class="accounts-wrapper">
  <Paper>
   <div class="buttons">
    <Button img="img/accounts.svg" text="Add a new account" colorVariable="--icon-black" onClick={addAccountModal} />
    <Button img="img/export.svg" text="Export" onClick={clickExport} />
    <Button img="img/import.svg" text="Import" onClick={clickImport} />
   </div>

   <Accordion items={$accounts_config.map(a => ({ ...a, name: a.settings?.title }))} activeIndex={null} content={accountTable} header={status} expandAllOnDesktop={true} mode="multiple" />
  </Paper>
 </div>
</div>

<Modal title={idItem === null ? 'Add a new account' : 'Edit account'} body={ModalAccountsAddEdit} params={{ id: idItem || null }} bind:show={showAddEditAccountModal} />
<Modal title="Export all accounts" body={AccountsExport} bind:show={showExportModal} />
<Modal title="Import accounts" body={AccountsImport} bind:show={showImportModal} />
{#if showDelAccountModal}
 <Modal title="Delete the account" body={ModalAccountsDelete} params={{ id: idItem, name: accountTitle }} bind:show={showDelAccountModal} />
{/if}
