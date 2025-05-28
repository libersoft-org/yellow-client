<script lang="ts">
 import Button from '../Button/Button.svelte';
 import Dialog from '../Dialog/Dialog.svelte';
 import { accounts_config } from '../../core.js';
 import { get } from 'svelte/store';

 type Props = {
  importText: string;
  close: () => void;
  onError: (message: string) => void;
 };

 let { importText, close, onError }: Props = $props();

 let replaceDialog: any = $state(null);
 let closeReplaceDialog: (() => void) | undefined = $state(undefined);

 const replaceDialogData = {
  title: 'Replace Configuration',
  body: 'This will replace your current account configuration. All existing accounts will be lost. Are you sure you want to continue?',
  icon: 'img/import.svg',
  buttons: [
   { text: 'Replace', onClick: confirmReplace, expand: true },
   { text: 'Cancel', onClick: () => closeReplaceDialog?.(), expand: true },
  ],
 };

 function addAccounts() {
  try {
   const newConfig = JSON.parse(importText);
   const currentConfig = get(accounts_config);

   // Create a set of existing account identifiers (server + address)
   const existingAccounts = new Set(currentConfig.map(account => `${account.server}\\\\${account.address}`));

   // Filter out accounts that already exist
   const accountsToAdd = newConfig.filter(account => {
    const identifier = `${account.server}\\\\${account.address}`;
    return !existingAccounts.has(identifier);
   });

   if (accountsToAdd.length === 0) {
    onError('No new accounts to add - all accounts already exist');
    return;
   }

   // Add new accounts to existing configuration
   accounts_config.update(current => [...current, ...accountsToAdd]);
   close();
  } catch (err) {
   onError('Invalid JSON format');
   console.error('Add accounts error:', err);
  }
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
 <Button img="img/plus.svg" text="Add Missing" onClick={addAccounts} />
 <Button img="img/import.svg" text="Replace All" onClick={replaceAccounts} />
</div>

<Dialog data={replaceDialogData} bind:close={closeReplaceDialog} bind:this={replaceDialog} />
