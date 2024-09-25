<script>
 import { onMount } from 'svelte';
 import Core from '../core.js';
 import Socket from '../socket.js';
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

 function sendLoginCommand(account) {
  Socket.send('user_login', { address: account.credentials.address, password: account.credentials.password }, false, (req, res) => {
   account.loggingIn = false;
   if (res.error !== 0) {
    account.error = res.message;
    return;
   }
   else
    error = null;

   Core.account.update(() => account);

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

</div>
