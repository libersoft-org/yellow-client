<script>
 import { onMount } from 'svelte';
 import { get } from "svelte/store";
 import '../app.css';
 import { active_account, accounts_config, selected_corepage_id, selected_module_id, isClientFocused, hideSidebarMobile, getModuleDecls } from '../core/core.js';

 import Menu from '../core/components/menu.svelte';
 import MenuBar from '../core/components/menu-bar.svelte';
 import ModuleBar from '../core/components/module-bar.svelte';
 import AccountBar from '../core/components/account-bar.svelte';
 import WelcomeSidebar from '../core/pages/welcome-sidebar.svelte';
 import WelcomeContent from '../core/pages/welcome-content.svelte';
 import Accounts from '../core/pages/accounts.svelte';
 import Wizard from '../core/components/wizard.svelte';
 import WelcomeWizardStep1 from '../core/wizards/welcome-step1.svelte';
 import WelcomeWizardStep2 from '../core/wizards/welcome-step2.svelte';
 import WelcomeWizardStep3 from '../core/wizards/welcome-step3.svelte';


 import {} from '../modules/messages/messages.js';
 import {} from '../modules/contacts/contacts.js';
 import {} from '../modules/wallet/wallet.js';

 let isWelcomeWizardOpen = false;

  const welcomeWizardSteps = [
  { title: 'Welcome to Yellow', component: WelcomeWizardStep1 },
  { title: 'Connect your account', component: WelcomeWizardStep2 },
  { title: 'All set!', component: WelcomeWizardStep3 }
 ];

 const corePages = {
  accounts: {
   id: 'accounts',
   sidebar: WelcomeSidebar,
   content: Accounts
  }
 }

 //this should probably be a part of module decl:
/*
 const modules = {
  messages: {
   id: 'messages',
   sidebar: ConversationsList,
   content: ConversationsMain
  },
  contacts: {
   id: 'contacts',
   sidebar: ContactsList,
   content: Contact
  },
  wallet: {
   id: 'wallet',
   sidebar: WalletSidebar,
   content: WalletContent
  }
 };
*/
 const product = 'Yellow';
 const version = '0.01';
 const link = 'https://yellow.libersoft.org';
 let status;
 let statusVisible = true;
 let isMenuOpen = false;
 let sideBar;
 let resizer;
 let isResizingSideBar = false;
 let selectedCorePage;
 let selectedModule;

 $: selectedCorePage = corePages[$selected_corepage_id];
 $: console.log('selectedCorePage: ', selectedCorePage);
 $: selectedModule = getModuleDecls()[$selected_module_id];
 $: console.log('selectedModule: ', selectedModule);

 onMount(() => {
  console.log('+page onMount');
  getModuleDecls();
  window.addEventListener('focus', () => isClientFocused.update(() => true));
  window.addEventListener('blur', () => isClientFocused.update(() => false));
  window?.chrome?.webview?.postMessage('Testing message from JavaScript to native notification');
  if (get(accounts_config).length === 0) {
   isWelcomeWizardOpen = true;
  }
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

 function onSelectModule(id) {
  selected_corepage_id.set(null);
  console.log('onSelectModule: ' + id);
  selected_module_id.set(id);
  console.log('selected_module_id: ' + get(selected_module_id));

  accounts_config.update((accounts) => {
   accounts.forEach((account) => {
    if (account.id === get(active_account).id) {
     account.last_module_id = id;
    }
   });
   return accounts;
  });
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
 {#if statusVisible}
  <div class="status {status?.class ? status.class : ''}">
   <div class="panel {status?.class ? status.class : ''}">
    <div class="close" role="button" tabindex="0" on:click={clickStatusClose} on:keydown={keyStatusClose}><img src="img/close.svg" alt="X"></div>
   </div>
   <div class="text">{status?.message ? status.message : ''}</div>
  </div>
 {/if}
 <div class="sidebar {$hideSidebarMobile ? 'hidden' : ''}" bind:this={sideBar}>
  <Menu bind:isMenuOpen {product} {version} {link}/>
  <MenuBar bind:isMenuOpen/>
  <AccountBar/>
  <ModuleBar {onSelectModule}/>
  {#if selectedCorePage}
   <svelte:component this={selectedCorePage.sidebar}/>
  {:else if selectedModule}
   <svelte:component this={selectedModule.panels.sidebar}/>
  {:else}
   <WelcomeSidebar/>
  {/if}
 </div>
 <div class="resizer" role="none" bind:this={resizer} on:mousedown={startResizeSideBar}></div>

 <div class="content">
  {#if selectedCorePage}
   <svelte:component this={selectedCorePage.content}/>
  {:else if selectedModule}
   <svelte:component this={selectedModule.panels.content}/>
  {:else}
   <WelcomeContent {product} {version} {link}/>
  {/if}
 </div>
</div>
{#if isWelcomeWizardOpen}
 <Wizard steps={welcomeWizardSteps} onClose={() => isWelcomeWizardOpen = false} />
{/if}
