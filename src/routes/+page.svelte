<script>
 import { onMount, onDestroy } from 'svelte';
 import Socket from '../scripts/socket';
 import Auth from '../scripts/auth';
 import Login from '../components/login.svelte';
 import Menu from '../components/menu.svelte';
 import MenuBar from '../components/menu-bar.svelte';
 import ModuleBar from '../components/module-bar.svelte';
 import Welcome from '../components/welcome.svelte';
 import Messages from '../components/messages/messages.svelte';
 import Contacts from '../components/contacts/contacts.svelte';
 import "../app.css";

 const requests = [];
 let product = 'Yellow';
 let version = '0.01';
 let link = 'https://yellow.libersoft.org';
 let isLoggingIn = false;
 let loginError;
 let server;
 let isMenuOpen = false;
 let sideBar;
 let isResizingSideBar = false;
 let selectedModule = Messages;
 let sidebarHTML = '';
 let contentHTML = '';

 onMount(async () => {
  server = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/';
  let storedLogin = localStorage.getItem('login');
  if (storedLogin) {
   storedLogin = JSON.parse(storedLogin);
   if (await Socket.connect(storedLogin.server, () => {
    if (Auth.userAddress) alert('Lost connection with server');
   })) {
    login(storedLogin);
   }
  } else {
   isLoggingIn = false;
   const errorMessage = 'Unable to connect to server. Please check the server address.';
   if (Auth.userAddress) loginError = { message: errorMessage };
   else alert('Error: ' + errorMessage);
  }
 });

 function startResizeSideBar() {
  isResizingSideBar = true;
  document.body.style.userSelect = 'none';
  window.addEventListener('mousemove', resizeSideBar);
  window.addEventListener('mouseup', stopResizeSideBar);
 }

 function stopResizeSideBar() {
  isResizingSideBar = false;
  document.body.style.userSelect = '';
  window.removeEventListener('mousemove', resizeSideBar);
  window.removeEventListener('mouseup', stopResizeSideBar);
 }
 
 function resizeSideBar(e) {
  const min = 250;
  const max = 500;
  if (isResizingSideBar) {
   let sideBarWidth = e.clientX < max ? e.clientX : max;
   sideBarWidth = e.clientX > min ? sideBarWidth : min;
   sideBar.style.width = sideBarWidth + 'px';
  }
 }

 function toggleMenu() {
  isMenuOpen = !isMenuOpen;
 }

 function closeMenu() {
  isMenuOpen = false;
 }

 /* TODO: previous command switching
 switch (req.command) {
    case 'user_login':
     Auth.userAddress = req.params.address;
     Auth.sessionID = res.data.sessionID; 
     if (res.error === 0) {
      //TODO: this has to be executed in +page.svelte core:
      //loginError = null;
     } else {
      isLoggingIn = false;
      //TODO: this has to be executed in +page.svelte core:
      //loginError = res;
     }
     //resLogin(res, req, credentials);
     break;
    case 'user_list_conversations':
     //TODO: send to messages module
     //if (objMessages) objMessages.resListConversations(res);
     break;
    case 'user_list_messages':
     //TODO: send to messages module
     //if (objMessages) objMessages.resListMessages(res);
     break;
    case 'user_send_message':
     //TODO: send to messages module
     //resSendMessage(res, req);
   }
 */

 function initModule(Module) {
  if (selectedModule) {
   selectedModule = new Module({
    target: document.createElement('div'),
    props: {
     setSidebarHTML: (html) => sidebarHTML = html,
     setContentHTML: (html) => contentHTML = html
    }
   });
   selectedModule.init();
  }
 }

 function login(credentials) {
  isLoggingIn = true;
  Socket.send('user_login', { address: credentials.address, password: credentials.password }, false, (req, res) => {
   isLoggingIn = false;
   if (res.error !== 0) {
    loginError = res;
   } else {
    loginError = null;
    Auth.userAddress = credentials.address;
    Auth.sessionID = res.data.sessionID;
    if (credentials.stayLoggedIn) localStorage.setItem('login', JSON.stringify(credentials));
    initModule(Messages);
   }
  });
 }

 function logout() {
  if (Socket.disconnect()){
   Auth.userAddress = null;
   Auth.sessionID = null;
   //TODO: set this in Messages module
   //selectedConversation = null;
   //messagesArray = [];
   isMenuOpen = false;
   isLoggingIn = false;
   localStorage.removeItem('login');
  }
 }
</script>

<style>
 .app {
  display: flex;
  height: 100vh;
 }

 .sidebar {
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
  box-shadow: var(--shadow);
 }

 .resizer {
  display: hidden;
  width: 100px;
  margin-left: -5px;
  cursor: ew-resize;
 }

 .content {
  flex-grow: 1;
 }

 @media (max-width: 768px) {
 .sidebar {
  position: absolute;
  width: 100%;
  height: 100%;
 }

 .sidebar.hidden {
  display: none;
 }

 .content.hidden {
  display: none;
 }

 .resizer {
  display: none;
 }
}
</style>

<svelte:head>
 <title>{product}</title>
</svelte:head>

<div class="app">
 {#if Auth.userAddress}
 <div class="sidebar" bind:this={sideBar}>
  <Menu {isMenuOpen} {product} {version} {link} onMenuClose={closeMenu} onLogout={logout} />
  <MenuBar {toggleMenu} />
  <ModuleBar />
  {#if selectedModule}
   {@html sidebarHTML}
  {:else}
   <div>Nothing here</div>
  {/if}
 </div>
 <div class="resizer" role="none" on:mousedown={startResizeSideBar}></div>
 <div class="content">
  {#if selectedModule}
   {@html contentHTML}
  {:else}
   <Welcome {product} {version} {link} />
  {/if}
 </div>
 {:else}
  <Login onLogin={login} error={loginError} {isLoggingIn} {server} {product} {version} {link} />
 {/if}
</div>
