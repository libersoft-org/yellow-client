<script>
 import { onMount } from 'svelte';
 import { addAccount, findAccountConfig, saveAccount } from '../accounts_config.js';
 import { accounts } from '../core.js';
 import Button from '../components/button.svelte';
 import AccountStatus from '../components/account-status.svelte';
 import AccountStatusIcon from '../components/account-status-icon.svelte';
 import { derived, get, writable } from 'svelte/store';
 export let close;
 export let params;
 export let isInWelcomeWizard = false;
 export let save_id;

 let titleElem;
 let error;
 let credentials_address;
 let credentials_server;
 let credentials_password;
 let config_enabled;
 let config_title;
 let acc;
 let retry_nonce = 0;

 let account_id_store = writable(null);
 $: account_id_store.set(params.id);

 account_id_store.subscribe(value => {
  console.log('ACCOUNT-ID-STORE-EMITTED', value);
 });

 let account_store = derived([accounts, account_id_store], ([$accounts, $account_id_store]) => {
  let r = $accounts.find(acc => get(acc).id === $account_id_store);
  console.log('ACCOUNT-STORE-FIRED', $accounts, $account_id_store, r);
  return r;
 });

 let account = derived(account_store, ($account_store, set) => {
  if (!$account_store) {
   return set(null);
  }
  const unsubscribe = $account_store.subscribe(account => {
   console.log('$ACCOUNT-STORE-EMITTED', account);
   set(account);
  });
  return () => unsubscribe();
 });

 account.subscribe(value => {
  acc = value;
  console.log('ACCACCACCACCACCACCACCACCACCACCACCACCACCACCACCACCACCACCACCACCACC', acc);
 });

 onMount(() => {
  titleElem.focus();
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

  return true;
 }

 function clickAdd() {
  if (!verify()) return;
  params.id = addAccount({ enabled: config_enabled, credentials: { address: credentials_address, server: credentials_server, password: credentials_password } }, { title: config_title });
  if (save_id) save_id(params.id);
  close();
 }

 function clickSave() {
  if (!verify()) return;
  saveAccount(params.id, { enabled: config_enabled, credentials: { address: credentials_address, server: credentials_server, password: credentials_password, retry_nonce } }, { title: config_title });
  retry_nonce++;
  if (save_id) save_id(params.id);
  close();
 }

 function keyEnter() {
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

 .form .group {
  display: flex;
  flex-direction: column;
  gap: 2px;
 }

 .form .group .label {
  font-size: 15px;
  padding-left: 5px;
  font-weight: bold;
 }

 .form .group input {
  padding: 10px;
  border: 1px solid #999;
  border-radius: 10px;
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
  gap: 5px;
 }
</style>

<div class="form">
 <div class="group">
  <span><span class="label">Title:</span></span>
  <input type="text" bind:value={config_title} on:keydown={keyEnter} bind:this={titleElem} />
 </div>
 <div class="group">
  <div class="label">Server:</div>
  <input type="text" placeholder="wss://your_server/" bind:value={credentials_server} on:keydown={keyEnter} />
 </div>
 <div class="group">
  <div class="label">Address:</div>
  <input type="text" placeholder="user@domain.tld" bind:value={credentials_address} on:keydown={keyEnter} />
 </div>
 <div class="group">
  <div class="label">Password:</div>
  <input type="password" placeholder="Your password" bind:value={credentials_password} on:keydown={keyEnter} />
 </div>
 {#if !isInWelcomeWizard}
  <div class="group">
   <div class="label">
    Enabled:
    <input type="checkbox" bind:checked={config_enabled} />
   </div>
  </div>
 {/if}
 {#if error}
  <div class="error">
   <div class="bold">Error:</div>
   <div>{error}</div>
  </div>
 {/if}
 {#if (params.id ?? null) === null}
  <Button on:click={clickAdd} text="Add the account" />
 {:else}
  <Button on:click={clickSave} text="Save" />
 {/if}
 {#if account && acc}
  <div class="status">
   <div class="bold">Status:</div>
   <div><AccountStatusIcon a={account} /></div>
   <div><AccountStatus {acc} /></div>
  </div>
 {/if}
</div>
