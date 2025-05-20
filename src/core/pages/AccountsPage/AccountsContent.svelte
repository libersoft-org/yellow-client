<script lang="ts">
 import { debug, findAccount, selected_corepage_id, accounts_config, hideSidebarMobile, isMobile } from '../../core.js';
 import Button from '@/core/components/Button/Button.svelte';
 import TableActionItems from '../../components/Table/TableActionItems.svelte';
 import Icon from '../../components/Icon/Icon.svelte';
 import ResponsiveTable from '../../components/ResponsiveTable/Table.svelte';
 import ResponsiveTableTHead from '../../components/ResponsiveTable/TableTHead.svelte';
 import ResponsiveTableTHeadTr from '../../components/ResponsiveTable/TableTHeadTr.svelte';
 import ResponsiveTableTHeadTh from '../../components/ResponsiveTable/TableTHeadTh.svelte';
 import ResponsiveTableTBody from '../../components/ResponsiveTable/TableTBody.svelte';
 import ResponsiveTableTBodyTr from '../../components/ResponsiveTable/TableTBodyTr.svelte';
 import ResponsiveTableTBodyTh from '../../components/ResponsiveTable/TableTBodyTh.svelte';
 import ResponsiveTableTBodyTd from '../../components/ResponsiveTable/TableTBodyTd.svelte';
 import Modal from '../../components/Modal/Modal.svelte';
 import ModalAccountsAddEdit from '@/core/modals/AccountsAddEdit.svelte';
 import ModalAccountsDelete from '@/core/modals/AccountsDelete.svelte';
 import AccountsExport from '@/core/modals/AccountsExport.svelte';
 import AccountsImport from '@/core/modals/AccountsImport.svelte';
 import AccountStatusIconIconAndText from '@/core/components/Account/AccountStatusIconIconAndText.svelte';
 import Accordion from '@/core/components/Accordion/Accordion.svelte';

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

 $inspect($accounts_config, 'Accounts config');
</script>

<style>
 .accounts {
  background: url('/img/background.webp') repeat;
  background-size: 400px;

  .accounts-wrapper {
   display: flex;
   flex-direction: column;
   padding: clamp(16px, 1.6vw, 24px);
   gap: clamp(16px, 1.6vw, 24px);
   height: calc(100vh - 20px);
   max-width: 800px;
   margin: 0 auto;
  }
 }

 .header {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(16px, 1.6vw, 24px);
 }

 .title {
  margin: 0;
  font-size: clamp(20px, 2vw, 28px);
  text-align: left;
  color: #222;
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

{#snippet accountTable()}
 {#if $accounts_config.length !== 0}
  <ResponsiveTable>
   <ResponsiveTableTHead>
    <ResponsiveTableTHeadTr>
     <ResponsiveTableTHeadTh>Status</ResponsiveTableTHeadTh>
     <ResponsiveTableTHeadTh>Title</ResponsiveTableTHeadTh>
     <ResponsiveTableTHeadTh>Server</ResponsiveTableTHeadTh>
     <ResponsiveTableTHeadTh>Address</ResponsiveTableTHeadTh>
     <ResponsiveTableTHeadTh>Enabled</ResponsiveTableTHeadTh>
     <ResponsiveTableTHeadTh>Action</ResponsiveTableTHeadTh>
    </ResponsiveTableTHeadTr>
   </ResponsiveTableTHead>
   {#each $accounts_config as a (a.id)}
    <ResponsiveTableTBody>
     <ResponsiveTableTBodyTr>
      <ResponsiveTableTBodyTh title="Status">
       <AccountStatusIconIconAndText account={findAccount(a.id)} />
      </ResponsiveTableTBodyTh>
      <ResponsiveTableTBodyTd title="Title">{a.settings?.title}</ResponsiveTableTBodyTd>
      <ResponsiveTableTBodyTd title="Server">{a.credentials.server}</ResponsiveTableTBodyTd>
      <ResponsiveTableTBodyTd title="Address">{a.credentials.address}</ResponsiveTableTBodyTd>
      <ResponsiveTableTBodyTd title="Enabled">{a.enabled ? 'Yes' : 'No'}</ResponsiveTableTBodyTd>
      <ResponsiveTableTBodyTd title="Action">
       <TableActionItems>
        <Icon img="img/edit.svg" alt="Edit" colorVariable="--icon-blue" size="20px" padding="5px" onClick={() => clickEdit(a.id)} />
        <Icon img="img/del.svg" alt="Delete" colorVariable="--icon-red" size="20px" padding="5px" onClick={() => clickDel(a.id, a.settings?.title)} />
       </TableActionItems>
      </ResponsiveTableTBodyTd>
     </ResponsiveTableTBodyTr>
    </ResponsiveTableTBody>
   {/each}
  </ResponsiveTable>
 {/if}
{/snippet}

{#snippet accountTableMobile(account)}
 <ResponsiveTable>
  <ResponsiveTableTHead>
   <ResponsiveTableTHeadTr>
    <ResponsiveTableTHeadTh>Status</ResponsiveTableTHeadTh>
    <ResponsiveTableTHeadTh>Title</ResponsiveTableTHeadTh>
    <ResponsiveTableTHeadTh>Server</ResponsiveTableTHeadTh>
    <ResponsiveTableTHeadTh>Address</ResponsiveTableTHeadTh>
    <ResponsiveTableTHeadTh>Enabled</ResponsiveTableTHeadTh>
    <ResponsiveTableTHeadTh>Action</ResponsiveTableTHeadTh>
   </ResponsiveTableTHeadTr>
  </ResponsiveTableTHead>
  <ResponsiveTableTBody>
   <ResponsiveTableTBodyTr>
    <ResponsiveTableTBodyTh title="Status">
     <AccountStatusIconIconAndText account={findAccount(account.id)} />
    </ResponsiveTableTBodyTh>
    <ResponsiveTableTBodyTd title="Title">{account.settings?.title}</ResponsiveTableTBodyTd>
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

<div class="accounts">
 <div class="accounts-wrapper">
  <div class="header">
   <Button img="img/back.svg" text="Back" onClick={back} hiddenOnDesktop={true} />
   <h2 class="title">Account management</h2>
  </div>
  <div class="buttons">
   <Button img="img/accounts.svg" text="Add a new account" colorVariable="--icon-black" onClick={addAccountModal} />
   <Button img="img/export.svg" text="Export" onClick={clickExport} />
   <Button img="img/import.svg" text="Import" onClick={clickImport} />
  </div>

  {#if $isMobile}
   <Accordion items={$accounts_config.map(a => ({ ...a, name: a.settings?.title }))} activeIndex={1} snippet={accountTableMobile} />
  {:else}
   {@render accountTable()}
  {/if}
 </div>
</div>

<Modal title={idItem === null ? 'Add a new account' : 'Edit account'} body={ModalAccountsAddEdit} params={{ id: idItem || null }} bind:show={showAddEditAccountModal} />
<Modal title="Export all accounts" body={AccountsExport} bind:show={showExportModal} />
<Modal title="Import accounts" body={AccountsImport} bind:show={showImportModal} />
{#if showDelAccountModal}
 <Modal title="Delete the account" body={ModalAccountsDelete} params={{ id: idItem, name: accountTitle }} bind:show={showDelAccountModal} />
{/if}
