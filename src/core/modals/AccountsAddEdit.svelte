<script lang="ts">
 import { getContext, untrack } from 'svelte';
 import { addAccount, findAccountConfig, saveAccount } from '../accounts_config.js';
 import { accountExists, accounts } from '../core.js';
 import Button from '../components/Button/Button.svelte';
 import Label from '../components/Label/Label.svelte';
 import Input from '../components/Input/Input.svelte';
 import Select from '../components/Select/Select.svelte';
 import Option from '../components/Select/SelectOption.svelte';
 import Switch from '../components/Switch/Switch.svelte';
 import AccountStatusIconIconAndText from '../components/Account/AccountStatusIconIconAndText.svelte';
 import { derived, get, writable } from 'svelte/store';
 import { TAURI } from '@/core/tauri.ts';

 type Props = {
  close: () => void;
  params: { id: string | null };
  isInWelcomeWizard?: boolean;
  save_id?: (id: string) => void;
 };

 let { close, params, isInWelcomeWizard = false, save_id }: Props = $props();

 let protocolElem: any = null;
 let protocol = $state('amtp');
 let error = $state('');
 let credentials_address = $state('');
 let credentials_server = $state('');
 let credentials_password = $state('');
 let config_enabled = $state(false);
 let config_title = $state('');
 let acc = $state();
 let retry_nonce = $state(0);
 type WizardContext = {
  setNextText: (text: string) => void;
 };

 let wizard = getContext<WizardContext>('wizard');

 let account_id_store = writable<string | null>(null);

 console.log('[INIT] Modal mounted. Params:', params);

 $effect(() => {
  console.log('[EFFECT] Updating account_id_store from params.id =', params.id);
  account_id_store.set(params.id);
 });

 // Observe full accounts store for debug
 accounts.subscribe(value => {
  console.log('[STORE] Full accounts store updated:', value.map(get));
 });

 let account = derived([accounts, account_id_store], ([$accounts, $id]) => {
  const found = $accounts.find((acc: { id: string }) => acc.id === $id);
  console.log('[DERIVED] account_id_store =', $id, '→ found account:', found ? get(found) : null);
  return found ?? null;
 });

 account.subscribe(value => {
  acc = value;
  console.log('[SUBSCRIBE] account store emitted acc =', value ? get(value) : null);
 });

 $effect(() => {
  protocolElem?.focus();
  console.log('[EFFECT] Checking if params.id exists:', params.id);

  if (params.id !== null) {
   let found = findAccountConfig(params.id);
   console.log('[EFFECT] Loaded existing config:', found);

   if (found?.credentials) {
    credentials_address = found.credentials.address;
    credentials_server = found.credentials.server;
    credentials_password = found.credentials.password;
   }
   config_enabled = found?.enabled ?? true;
   config_title = found?.settings?.title ?? 'My account';
  } else {
   console.log('[EFFECT] New account setup');
   credentials_address = '';
   credentials_server = TAURI ? '' : (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/';
   credentials_password = '';
   config_enabled = true;
   config_title = 'My account';

   if (isInWelcomeWizard) {
    untrack(() => {
     console.log('[EFFECT] In welcome wizard, setting skip');
     wizard?.setNextText('Skip');
    });
   }
  }
  return () => {
   console.log('[EFFECT] Cleanup on unmount');
   wizard?.setNextText('Next');
  };
 });

 function verify() {
  if (!credentials_server) {
   error = 'Server address is required';
   console.warn('[VERIFY] Server address is missing');
   return false;
  }
  if (!credentials_address) {
   error = 'Address is required';
   console.warn('[VERIFY] Address is missing');
   return false;
  }
  error = '';
  return true;
 }

 function clickAdd() {
  console.log('[ACTION] Clicked ADD');
  if (!verify()) return;

  const account = {
    enabled: config_enabled,
    credentials: {
     address: credentials_address,
     server: credentials_server,
     password: credentials_password,
    },
   };
  const settings = { title: config_title };

  if (accountExists(account.credentials?.server, account.credentials?.address)) {
   error = 'Account already exists with this server and address';
   return;
  }

  const id = addAccount(account, settings);

  console.log('[ACTION] Account added with ID:', id);
  params.id = id;

  save_id?.(id);
  wizard?.setNextText('Next');
  close();
 }

 function clickSave() {
  console.log('[ACTION] Clicked SAVE for ID:', params.id);
  if (!verify()) return;

  saveAccount(
   params.id,
   {
    enabled: config_enabled,
    credentials: {
     address: credentials_address,
     server: credentials_server,
     password: credentials_password,
     retry_nonce,
    },
   },
   { title: config_title }
  );

  console.log('[ACTION] Account saved:', params.id);
  retry_nonce++;
  if (params.id !== null) {
   save_id?.(params.id);
  }
  wizard?.setNextText('Next');
  close();
 }

 function keyEnter(event: KeyboardEvent) {
  if (event.key === 'Enter') {
   event.preventDefault();
   console.log('[KEY] Enter pressed');
   params.id === null ? clickAdd() : clickSave();
  }
 }
</script>

<style>
 .form {
  display: flex;
  flex-direction: column;
  gap: 15px;
 }
 .error {
  display: flex;
  gap: 5px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f33;
 }
 .status {
  display: flex;
  align-items: center;
  gap: 5px;
 }
</style>

<div class="form">
 <Label text="Protocol">
  <Select minWidth="300px" maxWidth="300px" bind:this={protocolElem} bind:value={protocol}>
   <Option text="AMTP" value="amtp" selected={protocol === 'amtp'} />
   <Option text="DMTP (not yet implemented)" value="dmtp" disabled selected={protocol === 'dmtp'} />
  </Select>
 </Label>

 <Label text="Title">
  <Input minWidth="300px" maxWidth="300px" bind:value={config_title} onKeydown={keyEnter} />
 </Label>

 <Label text="Server">
  <Input minWidth="300px" maxWidth="300px" placeholder="wss://your_server/" bind:value={credentials_server} onKeydown={keyEnter} />
 </Label>

 <Label text="Address">
  <Input minWidth="300px" maxWidth="300px" placeholder="user@domain.tld" bind:value={credentials_address} onKeydown={keyEnter} />
 </Label>

 <Label text="Password">
  <Input minWidth="300px" maxWidth="300px" type="password" placeholder="Your password" bind:value={credentials_password} onKeydown={keyEnter} />
 </Label>

 {#if !isInWelcomeWizard}
  <Switch showLabel ariaLabel="Enabled" bind:checked={config_enabled} />
 {/if}

 {#if error}
  <div class="error">
   <strong>Error:</strong>
   {error}
  </div>
 {/if}

 {#if params.id === null}
  <Button data-testid="add" text="Add the account" onClick={clickAdd} width="100%" />
 {:else}
  <Button data-testid="save" img="img/save.svg" text="Save" onClick={clickSave} width="100%" />
 {/if}

 {#if account && acc}
  <div class="status">
   <strong>Status:</strong>
   <AccountStatusIconIconAndText {account} />
  </div>
 {/if}
</div>
