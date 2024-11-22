<script>
 import { onMount, setContext } from 'svelte';
 import { get } from 'svelte/store';
 import '../app.css';
 import { active_account, accounts_config, selected_corepage_id, selected_module_id, isClientFocused, hideSidebarMobile, getModuleDecls, debug } from '../core/core.js';

 import Menu from '../core/components/menu.svelte';
 import MenuBar from '../core/components/menu-bar.svelte';
 import ModuleBar from '../core/components/module-bar.svelte';
 import AccountBar from '../core/components/account-bar.svelte';
 import WelcomeSidebar from '../core/pages/welcome-sidebar.svelte';
 import WelcomeContent from '../core/pages/welcome-content.svelte';
 import Accounts from '../core/pages/accounts.svelte';
 import Wizard from '../core/components/wizard.svelte';
 import WizardWelcomeStep1 from '../core/wizards/welcome-step1.svelte';
 import WizardWelcomeStep2 from '../core/wizards/welcome-step2.svelte';
 import WizardWelcomeStep3 from '../core/wizards/welcome-step3.svelte';
 import {} from '../modules/messages/messages.js';
 import {} from '../modules/contacts/contacts.js';
 import {} from '../modules/wallet/module.js';
 import {} from '../modules/iframes/module.js';
 import ModalWallets from '../modules/wallet/modals/wallets.svelte';
 import Modal from '../core/components/modal.svelte';
 let showWelcomeWizard = false;
 let wizardData = {
  steps: [
   { title: 'Welcome to Yellow', component: WizardWelcomeStep1 },
   { title: 'Connect your account', component: WizardWelcomeStep2 },
   { title: 'All set!', component: WizardWelcomeStep3 },
  ],
 };
 const corePages = {
  accounts: {
   id: 'accounts',
   sidebar: WelcomeSidebar,
   content: Accounts,
  },
 };
 let content;

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
 let isMenuOpen = false;
 let sideBar;
 let resizer;
 let isResizingSideBar = false;
 let selectedCorePage;
 let selectedModuleDecl;
 let contentElement;
 setContext('contentElement', contentElement);

 $: selectedCorePage = corePages[$selected_corepage_id];
 $: console.log('selectedCorePage: ', selectedCorePage);
 $: selectedModuleDecl = getModuleDecls()[$selected_module_id];
 $: console.log('selectedModuleDecl: ', selectedModuleDecl);

 onMount(() => {
  console.log('+page onMount');
  window.addEventListener('focus', () => isClientFocused.update(() => true));
  window.addEventListener('blur', () => isClientFocused.update(() => false));
  window.addEventListener('keydown', onkeydown);
  window?.chrome?.webview?.postMessage('Testing message from JavaScript to native notification');
  if (get(accounts_config).length === 0) {
   console.log('showWelcomeWizard = true');
   showWelcomeWizard = true;
  }
  setupIframeListener();
 });

 function setupIframeListener() {
  window.addEventListener('message', event => {
   console.log('event.data: ', event.data);
  });
 }

 function onSelectModule(id) {
  selected_corepage_id.set(null);
  console.log('onSelectModule: ' + id);
  selected_module_id.set(id);
  console.log('selected_module_id: ' + get(selected_module_id));

  console.log('active_account: ', get(active_account));
  console.log('accounts_config: ', get(accounts_config));
  if (!get(active_account)) return;

  accounts_config.update(accounts => {
   accounts.forEach(account => {
    if (account.id === get(active_account).id) {
     account.settings = account.settings ? account.settings : {};
     account.settings.last_module_id = id;
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

 async function onkeydown(event) {
  console.log('window onkeydown: ', event);
  if (event.ctrlKey && (event.key === '`' || event.key === '~' || event.key === ';' )) {
   debug.update(d => !d);
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

<svelte:window {onkeydown} />

<svelte:head>
 <title>{product}</title>
</svelte:head>

<div class="app">
 <div class="sidebar {$hideSidebarMobile ? 'hidden' : ''}" bind:this={sideBar}>
  <Menu bind:showMenu={isMenuOpen} {product} {version} {link} />
  <MenuBar bind:isMenuOpen />
  <AccountBar />
  <ModuleBar {onSelectModule} />
  {#if selectedCorePage}
   <svelte:component this={selectedCorePage.sidebar} />
  {:else if selectedModuleDecl}
   <svelte:component this={selectedModuleDecl.panels.sidebar} />
  {:else}
   <WelcomeSidebar />
  {/if}
 </div>
 <div class="resizer" role="none" bind:this={resizer} on:mousedown={startResizeSideBar}></div>

 <div class="content" bind:this={contentElement}>
  {#if selectedCorePage}
   <svelte:component this={selectedCorePage.content} />
  {:else if selectedModuleDecl}
   <svelte:component this={selectedModuleDecl.panels.content} bind:this={content} />
  {:else}
   <WelcomeContent {product} {version} {link} />
  {/if}
 </div>
</div>
<Modal body={Wizard} bind:show={showWelcomeWizard} params={wizardData} />
