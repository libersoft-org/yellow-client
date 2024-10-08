<script>
 import { onMount } from 'svelte';
 import { addAccount, findAccount, saveAccount } from '../accounts_config.js';
 import Button from '../components/button.svelte';
 import { get } from 'svelte/store';
 import { accounts_config } from '../core.js';

 export let onClose;
 export let id;

 let serverElem;

 let error;

 let credentials_address;
 let credentials_server;
 let credentials_password;
 let config_enabled;
 let config_title;

 onMount(() => {
  serverElem.focus();
  if (id !== null) {
   let acc = findAccount(id);
   console.log('acc', acc);
   let credentials = acc.credentials;

   credentials_address = credentials.address;
   credentials_server = credentials.server;
   credentials_password = credentials.password;
   config_enabled = acc.enabled;
   config_title = acc.settings?.title;
  } else {
   credentials_address = '';
   credentials_server = '';
   credentials_password = '';
   config_enabled = true;
   config_title = 'My account';
  }
 });

 function clickAdd() {
  addAccount({ enabled: config_enabled, credentials: { address: credentials_address, server: credentials_server, password: credentials_password } }, { title: config_title });
  onClose();
 }

 function clickSave() {
  saveAccount(id, { enabled: config_enabled, credentials: { address: credentials_address, server: credentials_server, password: credentials_password } }, { title: config_title });
  onClose();
 }

 function keyEnter() {
  if (event.key === 'Enter') {
   event.preventDefault();
   clickAdd();
  }
 }
</script>

<div class="form">
 <div class="group">
  <div class="label">Title:</div>
  <input type="text" bind:value={config_title} on:keydown={keyEnter} />
 </div>
 <div class="group">
  <div class="label">Server:</div>
  <input type="text" placeholder="wss://your_server/" bind:value={credentials_server} on:keydown={keyEnter} bind:this={serverElem} />
 </div>
 <div class="group">
  <div class="label">Address:</div>
  <input type="text" placeholder="user@domain.tld" bind:value={credentials_address} on:keydown={keyEnter} />
 </div>
 <div class="group">
  <div class="label">Password:</div>
  <input type="password" placeholder="Your password" bind:value={credentials_password} on:keydown={keyEnter} />
 </div>
 <div class="group">
  <div class="label">
   Enabled:
   <input type="checkbox" bind:checked={config_enabled} />
  </div>
 </div>
 {#if error}
  <div class="error">
   <div class="bold">Error:</div>
   <div>{error}</div>
  </div>
 {/if}
 {#if id === null}
  <Button on:click={clickAdd} text="Add the account" />
 {:else}
  <Button on:click={clickSave} text="Save" />
 {/if}
</div>

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
</style>
