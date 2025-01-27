<script>
 import '../app.css';
 import { onMount, setContext } from 'svelte';
 import { active_account, accounts_config, selected_corepage_id, selected_module_id, isClientFocused, hideSidebarMobile, getModuleDecls, debug, product, version, link } from '../core/core.js';
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
 import {} from '../modules/org.libersoft.messages/module.js';
 import {} from '../modules/org.libersoft.contacts/module.js';
 import {} from '../modules/org.libersoft.wallet/module.js';
 import {} from '../modules/org.libersoft.iframes/module.js';
 import {} from '../modules/org.libersoft.dating/module.js';
 import Modal from '../core/components/modal.svelte';
 let menus = [];
 setContext('menus', menus);
 const wizardData = {
  steps: [
   { title: 'Welcome', component: WizardWelcomeStep1 },
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
 let showWelcomeWizard = false;
 let content;
 let isMenuOpen = false;
 let sideBar;
 let resizer;
 let isResizingSideBar = false;
 let selectedCorePage;
 let selectedModuleDecl;
 let contentElement;
 setContext('contentElement', contentElement);

 $: selectedCorePage = corePages[$selected_corepage_id];
 //$: console.log('selectedCorePage: ', selectedCorePage);
 $: selectedModuleDecl = getModuleDecls()[$selected_module_id];
 //$: console.log('selectedModuleDecl: ', selectedModuleDecl);

 onMount(() => {
  console.log('+page onMount');
  window.addEventListener('focus', () => isClientFocused.set(true));
  window.addEventListener('blur', () => isClientFocused.set(false));
  //window.addEventListener('keydown', onkeydown);
  window?.chrome?.webview?.postMessage('Testing message from JavaScript to native notification');
  if ($accounts_config.length === 0) {
   console.log('showWelcomeWizard = true');
   showWelcomeWizard = true;
  }
  setupIframeListener();

  // TODO: I don't know what this is, test out
  //document.body.style.touchAction = 'none';
  //document.documentElement.style.touchAction = 'none';
  const visualViewport = window.visualViewport;
  if (visualViewport) {
   visualViewport.addEventListener('resize', updateAppHeight);
   visualViewport.addEventListener('scroll', updateAppHeight); // is this necessary?
  } else window.addEventListener('resize', updateAppHeight);
  updateAppHeight();

  if ('virtualKeyboard' in navigator) {
   navigator.virtualKeyboard.addEventListener('geometrychange', event => {
    console.log(event.target.boundingRect);
   });
  }
 });

 function updateAppHeight() {
  console.log('updateAppHeight');
  const visualViewport = window.visualViewport;
  let viewportHeight;
  if (visualViewport) viewportHeight = visualViewport.height;
  else viewportHeight = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  const metaViewport = document.querySelector('meta[name="viewport"]');
  if (metaViewport) metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content');
 }

 function setupIframeListener() {
  window.addEventListener('message', event => {
   console.log('event.data: ', event.data);
  });
 }

 function onSelectModule(id) {
  selected_corepage_id.set(null);
  //console.log('onSelectModule: ' + id);
  selected_module_id.set(id);
  //console.log('selected_module_id: ' + $selected_module_id);
  //console.log('active_account: ', $active_account);
  //console.log('accounts_config: ', $accounts_config);
  if (!$active_account) return;
  accounts_config.update(accounts => {
   accounts.forEach(account => {
    if (account.id === $active_account.id) {
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
  const min = 200;
  const max = 700;
  if (isResizingSideBar) {
   let sideBarWidth = e.clientX < max ? e.clientX : max;
   sideBarWidth = e.clientX > min ? sideBarWidth : min;
   sideBar.style.minWidth = sideBarWidth + 'px';
   sideBar.style.maxWidth = sideBarWidth + 'px';
   resizer.style.left = sideBarWidth + 'px';
  }
 }

 async function onkeydown(event) {
  //console.log('window onkeydown: ', event);
  if (event.ctrlKey && (event.key === '`' || event.key === '~' || event.key === ';')) debug.update(d => !d);
 }
</script>

<style>
 .app {
  display: flex;
  width: 100vw;
  max-width: 100vw;
  height: var(--app-height, 100vh);
  max-height: var(--app-height, 100vh);
  overflow: hidden;
 }

 .sidebar {
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 300px;
  max-height: 100%;
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
  display: flex;
  flex-direction: column;
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
