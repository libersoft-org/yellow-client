<script>
 import "../app.css";
 import Core from '../core.js';
 import { onMount } from 'svelte';
 import Socket from '../core/socket.js';
 import { isClientFocused, hideSidebarMobile } from '../core/core.js';
 import Login from '../core/pages/login.svelte';
 import Menu from '../core/components/menu.svelte';
 import MenuBar from '../core/components/menu-bar.svelte';
 import ModuleBar from '../core/components/module-bar.svelte';
 import AccountBar from '../core/components/account-bar.svelte';
 import WelcomeSidebar from '../core/pages/welcome-sidebar.svelte';
 import WelcomeContent from '../core/pages/welcome-content.svelte';

 //Messages:
 import ConversationsList from '../modules/messages/pages/conversations-list.svelte';
 import ConversationsMain from '../modules/messages/pages/conversations-main.svelte';

 //Contacts:
 import ContactsList from '../modules/contacts/pages/contacts-list.svelte';
 import Contact from '../modules/contacts/pages/contact-detail.svelte';

 const modules = {
  messages: {
   sidebar: ConversationsList,
   content: ConversationsMain
  },
  contacts: {
   sidebar: ContactsList,
   content: Contact
  }
 };
 const product = 'Yellow';
 const version = '0.01';
 const link = 'https://yellow.libersoft.org';
 let status;
 let statusVisible = true;
 let isLoggedIn = false;
 let isMenuOpen = false;
 let sideBar;
 let resizer;
 let isResizingSideBar = false;
 let selectedModule;

 onMount(() => {
  window.addEventListener('focus', () => isClientFocused.update(() => true));
  window.addEventListener('blur', () => isClientFocused.update(() => false));
  window?.chrome?.webview?.postMessage('Testing message from JavaScript to native notification');
  Socket.events.addEventListener('open', event => {
   console.log('Connected to WebSocket:', event);
   status = { class: 'info', message: 'Connected to server' };
   statusVisible = true;
   setTimeout(() => { if (status.class === 'info') statusVisible = false; }, 5000);
  });
  Socket.events.addEventListener('error', event => {
   console.error('WebSocket error:', event);
   status = { class: 'error', message: 'ERROR' };
   statusVisible = true;
  });
  Socket.events.addEventListener('close', event => {
   console.log('WebSocket closed:', event);
   status = { class: 'error', message: 'Disconnected from server' };
   statusVisible = true;
   /*
   let time = 5;
   const intervalID = setInterval(() => {
    time--;
    status = { class: 'error', message: 'Reconnecting in ' + time + ' ...' };
    if (time <= 0) {
     status = { class: 'error', message: 'Reconnecting to server ...' };
     Socket.connect();
     clearInterval(intervalID);
    }
   }, 1000);
   */
  });
 });

 function clickStatusClose() {
  statusVisible = false;
 }

 function keyStatusClose() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickStatusClose();
  }
 }

 function onSelectModule(name) {
  selectedModule = modules[name];
 }

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
   sideBar.style.minWidth = sideBarWidth + 'px';
   sideBar.style.maxWidth = sideBarWidth + 'px';
   resizer.style.left = sideBarWidth + 'px';
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
  min-width: 300px;
  max-width: 300px;
  box-shadow: var(--shadow);
  background-color: #fff;
 }

 .resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 300px;
  width: 5px;
  cursor: ew-resize;
  background-color: transparent;
 }

 .content {
  flex-grow: 1;
 }

 .status {
  z-index: 1000;
  position: absolute;
  right: 10px;
  bottom: 10px;
  border-radius: 5px;
  overflow: hidden;
  font-weight: bold;
 }

 .status.info {
  color: #080;
  background-color: #dfd;
  border: 1px solid #080;
 }

 .status.error {
  color: #800;
  background-color: #fdd;
  border: 1px solid #800;
 }

 .status .panel {
  display: flex;
  justify-content: right;
  height: 20px;
 }

 .status .panel.info {
  background-color: #080;
 }

 .status .panel.error {
  background-color: #800;
 }

 .status .panel .close {
  display: flex;
  padding: 5px;
  cursor: pointer;
 }

 .status .panel .close img {
  width: 10px;
  height: 10px;
 }

 .status .text {
  padding: 10px;
 }

 @media (max-width: 768px) {
  .sidebar {
   position: absolute;
   min-width: 100%;
   max-width: 100%;
   height: 100%;
  }

  .sidebar.hidden {
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
 {#if !isLoggedIn}
  <Login bind:isLoggedIn {product} {version} {link} />
 {:else}
  {#if statusVisible}
   <div class="status {status?.class ? status.class : ''}">
    <div class="panel {status?.class ? status.class : ''}">
     <div class="close" role="button" tabindex="0" on:click={clickStatusClose} on:keydown={keyStatusClose}><img src="img/close.svg" alt="X"></div>
    </div>
    <div class="text">{status?.message ? status.message : ''}</div>
   </div>
  {/if}
  <div class="sidebar {$hideSidebarMobile ? 'hidden' : ''}" bind:this={sideBar}>
   <Menu bind:isMenuOpen bind:isLoggedIn {product} {version} {link} />
   <MenuBar bind:isMenuOpen />
   <ModuleBar {onSelectModule} />
   <AccountBar />
   {#if selectedModule}
    <svelte:component this={selectedModule.sidebar} {Core.account} />
   {:else}
    <WelcomeSidebar />
   {/if}
  </div>
  <div class="resizer" role="none" bind:this={resizer} on:mousedown={startResizeSideBar}></div>
  <div class="content">
   {#if selectedModule}
    <svelte:component this={selectedModule.content} {Core.account} />
   {:else}
    <WelcomeContent {product} {version} {link} />
   {/if}
  </div>
 {/if}
</div>
