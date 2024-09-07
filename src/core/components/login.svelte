<script>
 import { onMount } from 'svelte';
 import Core from '../core.js';
 import Socket from '../socket.js';
 export let error;
 export let isLoggedIn;
 export let product;
 export let version;
 export let link;
 let credentials = { server: '', address: '', password: '' };
 let stayLoggedIn = false;
 let loggingIn = false;

 onMount(() => {
  let storedLogin = localStorage.getItem('login');
  if (storedLogin) {
   storedLogin = JSON.parse(storedLogin);
   credentials = storedLogin;
   stayLoggedIn = true;
   clickLogin();
  } else credentials.server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/';
 });

 export function login(credentials) {
  if (Socket.status() === WebSocket.OPEN) {
   sendLoginCommand(credentials);
   return;
  }
  Socket.events.addEventListener('open', event => {
   console.log('Connected to WebSocket:', event);
   sendLoginCommand(credentials);
  });
  Socket.events.addEventListener('error', event => {
   console.error('WebSocket error:', event);
   error = 'Cannot connect to server';
   loggingIn = false;
  });
  Socket.events.addEventListener('close', event => {
   console.log('WebSocket closed:', event);
   loggingIn = false;
  });
  Socket.connect(credentials.server);
 }

 function sendLoginCommand(credentials) {
  Socket.send('user_login', { address: credentials.address, password: credentials.password }, false, (req, res) => {
   loggingIn = false;
   if (res.error !== 0) {
    error = res.message;
    return;
   }
   error = null;
   Core.userAddress = credentials.address;
   Core.sessionID = res.data.sessionID;
   isLoggedIn = true;
   if (stayLoggedIn) localStorage.setItem('login', JSON.stringify(credentials));
  });
 }

 function clickLogo() {
  window.open(link, '_blank');
 }

 function keyLogo() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickLogo();
  }
 }

 function clickLogin() {
  if (loggingIn) return;
  loggingIn = true;
  error = null;
  login(credentials);
 }

 function keyLogin() {
  if (event.key === 'Enter') {
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
  background: url('/img/background.webp') repeat;
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
  cursor: pointer;
 }

 .login .version {
  display: flex;
  justify-content: center;
  gap: 5px;
 }

 .login .logo img {
  width: 50px;
  height: 50px;
 }

 .login .logo .product {
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

 .login .form .group-h {
  display: flex;
  align-items: center;
  gap: 10px;
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
  <div class="logo" role="button" tabindex="0" on:click={clickLogo} on:keydown={keyLogo}>
   <img src="img/logo.svg" alt="{product}" />
   <div class="product">{product}</div>
  </div>
  <div class="version">
   <div>Version:</div>
   <div class="bold">{version}</div>
  </div>
  <div class="form">
   <div class="group">
    <div class="label">Server:</div>
    <input type="text" placeholder="wss://your_server/" bind:value={credentials.server} on:keydown={keyLogin} />
   </div>
   <div class="group">
    <div class="label">Address:</div>
    <input type="text" placeholder="user@domain.tld" bind:value={credentials.address} on:keydown={keyLogin} />
   </div>
   <div class="group">
    <div class="label">Password:</div>
    <input type="password" placeholder="Password" bind:value={credentials.password} on:keydown={keyLogin} />
   </div>
   <div class="group-h">
    <label class="switch">
     <input type="checkbox" bind:checked={stayLoggedIn} on:keydown={keyLogin} />
     <span class="slider"></span>
    </label>
    <div class="bold">Stay logged in</div>
   </div>
   {#if error}
    <div class="error">
     <div class="bold">Error:</div>
     <div>{error}</div>
    </div>
   {/if}
   <div class="button{loggingIn ? ' disabled' : ''}" role="button" tabindex="0" on:click={clickLogin} on:keydown={keyLogin}>
    {#if loggingIn}
     <div class="loader"></div>
    {:else}
     Login
    {/if}
   </div>
  </div>
 </div>
</div>
