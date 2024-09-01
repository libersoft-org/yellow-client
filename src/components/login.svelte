<script>
 import { onMount } from 'svelte';
 export let onLogin;
 export let error;
 export let isLoggingIn;
 let server;
 let address;
 let password;

 onMount(() => {
  server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/';
 });

 function clickLogin() {
console.log(isLoggingIn);
  if (!isLoggingIn) {
   error = null;
   onLogin({ server, address, password });
  }
 }

 function keyLogin() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickLogin();
  }
 }
</script>

<style>
 .background {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: url('img/background.png') repeat;
  background-size: 400px;
 }

 .login {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
  max-width: calc(100% - 60px);
  padding: 10px;
  border: 1px solid #999;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: var(--shadow);
 }

 .login .logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
 }

 .login .logo img {
  width: 50px;
  height: 50px;
 }

 .login .logo .text {
  font-size: 30px;
  font-weight: bold;
 }

 .login .form {
  display: flex;
  flex-direction: column;
  gap: 15px;
 }

 .login .form .group {
  display: flex;
  flex-direction: column;
  gap: 2px;
 }

 .login .form .group .label {
  font-size: 15px;
  padding-left: 5px;
  font-weight: bold;
 }

 .login .form .group input {
  padding: 10px;
  border: 1px solid #999;
  border-radius: 10px;
 }

 .login .form .error {
  display: flex;
  gap: 5px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f33;
 }
</style>

<div class="background">
 <div class="login">
  <div class="logo">
   <img src="favicon.svg" alt="Yellow" />
   <div class="text">Yellow</div>
  </div>
  <div class="form">
   <div class="group">
    <div class="label">Server:</div>
    <input type="server" placeholder="wss://your_server/" bind:value={server} />
   </div>
   <div class="group">
    <div class="label">Address:</div>
    <input type="address" placeholder="user@domain.tld" bind:value={address} />
   </div>
   <div class="group">
    <div class="label">Password:</div>
    <input type="password" placeholder="Password" bind:value={password} />
   </div>
   {#if error}
    <div class="error">
     <div class="bold">Error:</div>
     <div>{error.message}</div>
    </div>
   {/if}
   <div class="button{isLoggingIn ? ' disabled' : ''}" role="button" tabindex="0" on:click={clickLogin} on:keydown={keyLogin}>{isLoggingIn ? 'Logging in ...' : 'Login'}</div>
  </div>
 </div>
</div>
