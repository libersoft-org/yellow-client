<script lang="ts">
 import Button from '../Button/Button.svelte';
 import Dialog from '../Dialog/Dialog.svelte';
 import { accounts_config, accountExists } from '../../core.js';
 import { get } from 'svelte/store';

 type Props = {
  importText: string;
  close: () => void;
  onError: (message: string) => void;
 };

 let { importText, close, onError }: Props = $props();

 let replaceDialog: any = $state(null);
 let closeReplaceDialog: (() => void) | undefined = $state(undefined);
 let conflictDialog: any = $state(null);
 let closeConflictDialog: (() => void) | undefined = $state(undefined);
 let currentConflictAccount: any = $state(null);
 let remainingAccounts: any[] = $state([]);
 let processedCount = $state(0);

 const hasExistingAccounts = $derived(get(accounts_config).length > 0);

 const replaceDialogData = {
  title: 'Replace Configuration',
  body: 'This will replace your current account configuration. All existing accounts will be lost. Are you sure you want to continue?',
  icon: 'img/import.svg',
  buttons: [
   { text: 'Replace', onClick: confirmReplace, expand: true },
   { text: 'Cancel', onClick: () => closeReplaceDialog?.(), expand: true },
  ],
 };

 const conflictDialogData = $derived({
  title: 'Account Already Exists',
  body: currentConflictAccount ? `Account with address "${currentConflictAccount.credentials?.address || currentConflictAccount.address}" on server "${currentConflictAccount.credentials?.server || currentConflictAccount.server}" is already configured. What would you like to do?` : '',
  icon: 'img/import.svg',
  buttons: [
   { text: 'Replace Existing', onClick: replaceConflictAccount, expand: true },
   { text: 'Skip This Account', onClick: skipConflictAccount, expand: true },
   { text: 'Cancel Import', onClick: () => closeConflictDialog?.(), expand: true },
  ],
 });

 function addAccounts() {
  try {
   const newConfig = JSON.parse(importText);

   if (!Array.isArray(newConfig) || newConfig.length === 0) {
    onError('No accounts found in import data');
    return;
   }

   remainingAccounts = [...newConfig];
   processedCount = 0;
   processNextAccount();
  } catch (err) {
   onError('Invalid JSON format');
   console.error('Add accounts error:', err);
  }
 }

 function processNextAccount() {
  if (remainingAccounts.length === 0) {
   // Finished processing all accounts
   if (processedCount > 0) {
    close();
   } else {
    onError('No accounts were imported');
   }
   return;
  }

  const account = remainingAccounts.shift();
  const server = account.credentials?.server || account.server;
  const address = account.credentials?.address || account.address;

  if (accountExists(server, address)) {
   // Account exists, show conflict dialog
   currentConflictAccount = account;
   conflictDialog?.open();
  } else {
   // Account doesn't exist, add it
   accounts_config.update(current => [...current, account]);
   processedCount++;
   processNextAccount();
  }
 }

 function replaceConflictAccount() {
  if (currentConflictAccount) {
   const newServer = currentConflictAccount.credentials?.server || currentConflictAccount.server;
   const newAddress = currentConflictAccount.credentials?.address || currentConflictAccount.address;

   // Find and replace the existing account
   accounts_config.update(current => {
    const identifier = `${newServer}\\\\${newAddress}`;
    return current.map(account => {
     const accountServer = account.credentials?.server || account.server;
     const accountAddress = account.credentials?.address || account.address;
     const accountIdentifier = `${accountServer}\\\\${accountAddress}`;
     return accountIdentifier === identifier ? currentConflictAccount : account;
    });
   });
   processedCount++;
  }

  closeConflictDialog?.();
  currentConflictAccount = null;
  processNextAccount();
 }

 function skipConflictAccount() {
  closeConflictDialog?.();
  currentConflictAccount = null;
  processNextAccount();
 }

 function replaceAccounts() {
  const currentConfig = get(accounts_config);

  if (currentConfig.length > 0) {
   // Show warning dialog if there are existing accounts
   replaceDialog?.open();
  } else {
   // No existing accounts, proceed directly
   confirmReplace();
  }
 }

 function confirmReplace() {
  try {
   const newConfig = JSON.parse(importText);
   accounts_config.set(newConfig);
   closeReplaceDialog?.();
   close();
  } catch (err) {
   onError('Invalid JSON format');
   console.error('Replace accounts error:', err);
   closeReplaceDialog?.();
  }
 }
</script>

<style>
 .button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
 }

 .button-group :global(.button) {
  min-width: 120px;
 }
</style>

<div class="button-group">
 <Button img="img/plus.svg" text="Add accounts" onClick={addAccounts} />
 {#if hasExistingAccounts}
  <Button img="img/import.svg" text="Replace All" onClick={replaceAccounts} />
 {/if}
</div>

<Dialog data={replaceDialogData} bind:close={closeReplaceDialog} bind:this={replaceDialog} />
<Dialog data={conflictDialogData} bind:close={closeConflictDialog} bind:this={conflictDialog} />
