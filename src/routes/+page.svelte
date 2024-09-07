<script>
 import "../app.css";
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
 const requests = [];
 const product = 'Yellow';
 const version = '0.01';
 const link = 'https://yellow.libersoft.org';
 let server;
 let isLoggedIn = false;
 let loginError;
 let isMenuOpen = false;
 let sideBar;
 let isResizingSideBar = false;
 let selectedModule;
 let selectedModuleName;

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
  margin-left: -50px;
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
 {#if !isLoggedIn}
  <Login error={loginError} bind:isLoggedIn={isLoggedIn} {server} {product} {version} {link} />
 {:else}
  <div class="sidebar" bind:this={sideBar}>
   <Menu {isMenuOpen} {product} {version} {link} onMenuClose={closeMenu} />
   <MenuBar {toggleMenu} />
   <ModuleBar bind:selectedModule="{selectedModuleName}" />
   {#if selectedModule}
    <svelte:component this={selectedModule.sidebar} />
   {:else}
    <WelcomeSidebar {product} />
   {/if}
  </div>
  <div class="resizer" role="none" on:mousedown={startResizeSideBar}></div>
  <div class="content">
   {#if selectedModule}
    <svelte:component this={selectedModule.content} />
   {:else}
    <WelcomeContent {product} {version} {link} />
   {/if}
  </div>
 {/if}
</div>
