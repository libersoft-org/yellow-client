<script>
 import { onMount } from 'svelte';
 import { addAccount } from '../core.js';
 export let onClose;
 let credentials;
 let error;

 onMount(() => address.focus());

 function clickAdd() {
  if (address.value) {
   addAccount(credentials);
   onClose();
  }
 }

 function keyAdd() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickAdd();
  }
 }

 function keyEnter() {
  if (event.key === 'Enter') {
   event.preventDefault();
   clickAdd();
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
</style>

<div class="form">
 <div class="group">
  <div class="label">Server:</div>
  <input type="text" placeholder="wss://your_server/" bind:value={credentials.server} on:keydown={keyEnter} />
 </div>
 <div class="group">
  <div class="label">Address:</div>
  <input type="text" placeholder="user@domain.tld" bind:value={credentials.address} on:keydown={keyEnter} />
 </div>
 <div class="group">
  <div class="label">Password:</div>
  <input type="password" placeholder="Your password" bind:value={credentials.password} on:keydown={keyEnter} />
 </div>
 {#if error}
  <div class="error">
   <div class="bold">Error:</div>
   <div>{error}</div>
  </div>
 {/if}
 <div class="button{loggingIn ? ' disabled' : ''}" role="button" tabindex="0" on:click={clickAdd} on:keydown={keyAdd}>
  {#if loggingIn}
   <div class="loader"></div>
  {:else}
   Add the account
  {/if}
 </div>
</div>
