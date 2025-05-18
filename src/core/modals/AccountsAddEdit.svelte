<script>
 import { getContext, onMount } from 'svelte';
 import { addAccount, findAccountConfig, saveAccount } from '../accounts_config.js';
 import { accounts } from '../core.js';
 import Button from '../components/Button/Button.svelte';
 import Label from '../components/Label/Label.svelte';
 import Input from '../components/Input/Input.svelte';
 import Select from '../components/Select/Select.svelte';
 import Option from '../components/Select/SelectOption.svelte';
 import Switch from '../components/Switch/Switch.svelte';
 import { derived, get, writable } from 'svelte/store';
 import AccountStatusIconIconAndText from '../components/Account/AccountStatusIconIconAndText.svelte';

 export let close;
 export let params;
 export let isInWelcomeWizard = false;
 export let save_id;

 let protocolElem;
 let protocol = 'amtp';
 let error;
 let credentials_address;
 let credentials_server;
 let credentials_password;
 let config_enabled;
 let config_title;
 let acc;
 let retry_nonce = 0;
 let wizard = getContext('wizard');
 let account_id_store = writable(null);
 $: account_id_store.set(params.id);

 account_id_store.subscribe(value => {
  console.log('ModalAccountsAddEdit ACCOUNT-ID-STORE-EMITTED', value);
 });

 let account_store = derived([accounts, account_id_store], ([$accounts, $account_id_store]) => {
  let r = $accounts.find(acc => get(acc).id === $account_id_store);
  console.log('ModalAccountsAddEdit ACCOUNT-STORE-FIRED', $accounts, $account_id_store, r);
  return r;
 });

 let account = derived(account_store, ($account_store, set) => {
  if (!$account_store) return set(null);
  const unsubscribe = $account_store.subscribe(account => {
   console.log('ModalAccountsAddEdit $ACCOUNT-STORE-EMITTED', account);
   set(account);
  });
  return () => unsubscribe();
 });

 account.subscribe(value => {
  acc = value;
  console.log('ModalAccountsAddEdit isInWelcomeWizard=' + isInWelcomeWizard + ', acc=', acc);
 });

 onMount(() => {
  protocolElem.focus();
  if ((params.id ?? null) !== null) {
   console.log('params.id', params.id);
   let acc = findAccountConfig(params.id);
   console.log('acc', acc);
   let credentials = acc.credentials;
   credentials_address = credentials.address;
   credentials_server = credentials.server;
   credentials_password = credentials.password;
   config_enabled = acc.enabled;
   config_title = acc.settings?.title;
  } else {
   credentials_address = ''; //'me@' + replacePort(window.location.host, '');
   credentials_server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/';
   credentials_password = '';
   config_enabled = true;
   config_title = 'My account';
   if (wizard) wizard.setNextText('Skip');
  }
 });

 function replacePort(url, port) {
  return url.replace(/:\d+/, port);
 }

 function verify() {
  if (credentials_server === '') {
   error = 'Server address is required';
   return false;
  }

  if (credentials_address === '') {
   error = 'Address is required';
   return false;
  }
  error = '';
  return true;
 }

 function clickAdd() {
  if (!verify()) return;
  params.id = addAccount({ enabled: config_enabled, credentials: { address: credentials_address, server: credentials_server, password: credentials_password } }, { title: config_title });
  if (save_id) save_id(params.id);
  if (wizard) wizard.setNextText('Next');
  close();
 }

 function clickSave() {
  if (!verify()) return;
  saveAccount(params.id, { enabled: config_enabled, credentials: { address: credentials_address, server: credentials_server, password: credentials_password, retry_nonce } }, { title: config_title });
  retry_nonce++;
  if (save_id) save_id(params.id);
  if (wizard) wizard.setNextText('Next');
  close();
 }

 function keyEnter(event) {
  if (event.key === 'Enter') {
   event.preventDefault();
   if ((params.id ?? null) === null) clickAdd();
   else clickSave();
  }
 }
</script>

<style>
 .form {
  display: flex;
  flex-direction: column;
  gap: 15px;
 }

 .form .error {
  display: flex;
  gap: 5px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f33;
 }

 .form .status {
  display: flex;
  align-items: center;
  gap: 5px;
 }
</style>

<div class="form">
 <Label text="Protocol">
  <Select minWidth="300px" maxWidth="300px" bind:this={protocolElem} bind:value={protocol}>
   <Option text="AMTP" value="amtp" selected={protocol === 'amtp'} />
   <Option text="DMTP (not yet implemented)" value="dmtp" disabled={true} selected={protocol === 'dmtp'} />
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
  <Switch label="Enabled" bind:checked={config_enabled} />
 {/if}
 {#if error}
  <div class="error">
   <div class="bold">Error:</div>
   <div>{error}</div>
  </div>
 {/if}
 {#if (params.id ?? null) === null}
  <Button text="Add the account" onClick={clickAdd} />
 {:else}
  <Button data-testid="save" img="img/save.svg" text="Save" onClick={clickSave} />
 {/if}
 {#if account && acc}
  <div class="status">
   <div class="bold">Status:</div>
   <AccountStatusIconIconAndText {account} />
  </div>
 {/if}
</div>
