<script lang="ts">
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

 type Props = {
  showAddEditAccountModal: boolean;
  showDelAccountModal: boolean;
  showExportModal: boolean;
  showImportModal: boolean;
  idItem: string;
  accountTitle: string;
 };

 let { showAddEditAccountModal = $bindable(false), showDelAccountModal = false, showExportModal = $bindable(false), showImportModal = $bindable(false), idItem = $bindable(''), accountTitle = $bindable('') }: Props = $props();

 function back() {
  hideSidebarMobile.set(false);
  selected_corepage_id.set(null);
 }

 function addAccountModal() {
  idItem = '';
  showAddEditAccountModal = true;
 }

 function clickEdit(id: string) {
  idItem = id;
  showAddEditAccountModal = true;
 }

 const clickDel = (id: string, title: string) => {
  console.error(id, title);
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

 $inspect(idItem, accountTitle);
</script>

<style>
 table {
  border: 0;
  padding-bottom: 0;
  display: block;
  width: 100%;
  border-collapse: collapse;
  border-radius: 10px;
  overflow: clip;
  max-width: fit-content;
  border: 1px solid black !important;
  margin-top: 24px;
 }

 thead {
  display: none;
  background: black;
  color: white;
 }

 tbody,
 tr,
 th,
 td {
  border: 0;
  display: block;
  padding: 0;
  text-align: left;
  white-space: normal;
 }

 tbody {
  tr {
   background: #ffdd1150;

   &:hover {
    background: #fd1;
   }

   th,
   td {
    display: block;
    padding: 10px;
    text-align: left;
    vertical-align: middle; /* Note: vertical-align has no effect with display: block */

    &:before {
     display: inline-block;
     width: 90px;
    }
   }
  }
 }

 th[data-title]:before,
 td[data-title]:before {
  content: attr(data-title) ':\00A0';
  font-weight: bold;
 }

 th:not([data-title]) {
  font-weight: bold;
 }

 td:empty {
  display: none;
 }

 @media only screen and (min-width: 41em) {
  th[data-title]:before,
  td[data-title]:before {
   content: '';
   font-weight: bold;
  }

  th:not([data-title]) {
   font-weight: bold;
  }

  td:empty {
   display: table-cell;
  }

  thead {
   display: table-header-group;
  }

  tbody {
   display: table-header-group;
  }

  tbody,
  tr,
  th,
  td {
   border: 0;
   padding: 0;
   text-align: left;
   white-space: normal;
  }

  tbody tr {
   th,
   td {
    display: table-cell;
    padding: 10px;
    width: 100%;

    &:before {
     display: table;
     width: 100%;
    }
   }
  }

  th,
  td {
   display: table-cell;
   white-space: nowrap;
  }

  tr {
   display: table-row;
  }

  table {
   border-style: none;
   border-top-width: 0;
   width: auto;
  }

  tr {
   border-style: none;
   border-bottom-width: 0;
  }

  th,
  td {
   border-style: none;
   padding: 10px;
   text-align: center;
   min-width: 50px;
   vertical-align: middle;
  }

  /* th + th,
    th + td,
    td + th,
    td + td {
      border-left-width: 1px;
    } */

  thead tr:last-child {
   border-bottom-width: 2px;
  }

  /* thead th,
    tr.index th {
      font-weight: bold;
      line-height: 1.25;
      text-transform: uppercase;
    } */

  /* tbody:first-of-type tr.index th {
      padding-top: 1em;
    } */

  tbody th {
   font-weight: normal;
  }
 }

 /*end 41em MQ*/ /*end 41em MQ*/ /*end 41em MQ*/ /*end 41em MQ*/ /*end 41em MQ*/

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
        <Icon img="img/edit.svg" alt="Edit" colorVariable="--icon-blue" size={20} padding={5} onClick={() => clickEdit(a.id)} />
        <Icon img="img/del.svg" alt="Delete" colorVariable="--icon-red" size={20} padding={5} onClick={() => clickDel(a.id, a.settings?.title)} />
       </TableActionItems>
      </Td>
      {#if $debug}
       <Td class="center">{a.id}</Td>
      {/if}
     </TbodyTr>
    {/each}
   </Tbody>
  </Table>
  <table>
   <thead>
    <tr>
     <th scope="col">Status</th>
     <th scope="col">Title</th>
     <th scope="col">Server</th>
     <th scope="col">Address</th>
     <th scope="col">Enabled</th>
     <th scope="col">Action</th>
    </tr>
   </thead>
   <tbody>
    {#each $accounts_config as a (a.id)}
     <tr>
      <th scope="row" data-title="Status">
       <AccountStatusIconIconAndText account={findAccount(a.id)} />
      </th>
      <td data-title="Title">{a.settings?.title}</td>
      <td data-title="Server">{a.credentials?.server}</td>
      <td data-title="Address">{a.credentials?.address}</td>
      <td data-title="Enabled">{a.enabled ? 'Yes' : 'No'}</td>
      <td data-title="Action">
       <TableActionItems>
        <Icon img="img/edit.svg" alt="Edit" colorVariable="--icon-blue" size={20} padding={5} onClick={() => clickEdit(a.id)} />
        <Icon img="img/del.svg" alt="Delete" colorVariable="--icon-red" size={20} padding={5} onClick={() => clickDel(a.id, a.settings?.title)} />
       </TableActionItems>
      </td>
     </tr>
    {/each}
   </tbody>
  </table>
 </div>
</div>
<Modal title={idItem === null ? 'Add a new account' : 'Edit account'} body={ModalAccountsAddEdit} params={{ id: idItem }} bind:show={showAddEditAccountModal} />
{#if showDelAccountModal}
 <Modal title="Delete the account" body={ModalAccountsDelete} params={{ id: idItem, name: accountTitle }} bind:show={showDelAccountModal} />
{/if}
<Modal title="Export all accounts" body={AccountsExport} bind:show={showExportModal} />
<Modal title="Import accounts" body={AccountsImport} bind:show={showImportModal} />
