<script>
 import "../app.css";
 import { onMount } from 'svelte';
 import Socket from '../core/socket.js';
 import Login from '../core/components/login.svelte';
 import Menu from '../core/components/menu.svelte';
 import MenuBar from '../core/components/menu-bar.svelte';
 import ModuleBar from '../core/components/module-bar.svelte';
 import WelcomeSidebar from '../core/components/welcome-sidebar.svelte';
 import WelcomeContent from '../core/components/welcome-content.svelte';

 //Messages:
 import ConversationsList from '../modules/messages/components/conversations-list.svelte';
 import ConversationsMain from '../modules/messages/components/conversations-main.svelte';

 //Contacts:
 import ContactsList from '../modules/contacts/components/contacts-list.svelte';
 import Contact from '../modules/contacts/components/contact.svelte';

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
 let isLoggedIn = false;
 let isMenuOpen = false;
 let sideBar;
 let resizer;
 let isResizingSideBar = false;
 let selectedModule;
 let selectedModuleName;

 onMount(() => {
  //TODO - get real status:
  status = { class: 'info', message: 'CONNECTED' };

  Socket.events.addEventListener('open', event => {
   console.log('Connected to WebSocket:', event);
   status = { class: 'info', message: 'CONNECTED' };
  });
  Socket.events.addEventListener('error', event => {
   console.error('WebSocket error:', event);
   status = { class: 'error', message: 'ERROR' };
  });
  Socket.events.addEventListener('close', event => {
   console.log('WebSocket closed:', event);
   status = { class: 'error', message: 'DISCONNECTED' };
   let time = 5;
   const intervalID = setInterval(() => {
    time--;
    status = { class: 'error', message: 'DISCONNECTED, reconnecting in ' + time + ' ...' };
    if (time <= 0) {
     status = { class: 'error', message: 'RECONNECTING ...' };
     Socket.connect();
     clearInterval(intervalID);
    }
   }, 1000);
  });
 });

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
   sideBar.style.width = sideBarWidth + 'px';
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
  width: 300px;
  height: 100%;
  box-shadow: var(--shadow);
 }

 .resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 300px;
  width: 10px;
  margin-left: -5px;
  cursor: ew-resize;
  background-color: transparent;
 }

 .content {
  flex-grow: 1;
 }

 .status {
  position: absolute;
  padding: 10px;
  right: 10px;
  bottom: 10px;
  border-radius: 10px;
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
 {#if !isLoggedIn}
  <Login bind:isLoggedIn {product} {version} {link} />
 {:else}
  <div class="status {status.class}">{status.message}</div>
  <div class="sidebar" bind:this={sideBar}>
   <Menu bind:isMenuOpen bind:isLoggedIn {product} {version} {link} />
   <MenuBar bind:isMenuOpen />
   <ModuleBar {onSelectModule} />
   {#if selectedModule}
    <svelte:component this={selectedModule.sidebar} />
   {:else}
    <WelcomeSidebar {product} />
   {/if}
  </div>
  <div class="resizer" role="none" bind:this={resizer} on:mousedown={startResizeSideBar}></div>
  <div class="content">
   {#if selectedModule}
    <svelte:component this={selectedModule.content} />
   {:else}
    <WelcomeContent {product} {version} {link} />
   {/if}
  </div>
 {/if}
</div>
