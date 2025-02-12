<script>
 import '../app.css';
 import { onMount, setContext } from 'svelte';
 import { get } from 'svelte/store';
 import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
 import { isMobile, keyboardHeight, documentHeight, active_account, accounts_config, selected_corepage_id, selected_module_id, isClientFocused, hideSidebarMobile, module_decls, debug, product, version, link } from '../core/core.js';
 import Menu from '../core/components/menu.svelte';
 import MenuBar from '../core/components/menu-bar.svelte';
 import ModuleBar from '../core/components/module-bar.svelte';
 import AccountBar from '../core/components/account-bar.svelte';
 import WelcomeSidebar from '../core/pages/welcome-sidebar.svelte';
 import WelcomeContent from '../core/pages/welcome-content.svelte';
 import Accounts from '../core/pages/accounts.svelte';
 import Modal from '../core/components/modal.svelte';
 import Wizard from '../core/components/wizard.svelte';
 import WizardWelcomeStep1 from '../core/wizards/welcome-step1.svelte';
 import WizardWelcomeStep2 from '../core/wizards/welcome-step2.svelte';
 import WizardWelcomeStep3 from '../core/wizards/welcome-step3.svelte';
 import {} from '../modules/org.libersoft.messages/module.js';
 import {} from '../modules/org.libersoft.contacts/module.js';
 import {} from '../modules/org.libersoft.wallet/module.js';
 import {} from '../modules/org.libersoft.dating/module.js';
 import {} from '../modules/org.libersoft.iframes/module.js';
 let menus = [];
 setContext('menus', menus);

 let sidebarSize = localStorageSharedStore('sidebarSize', undefined);

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
 $: selectedModuleDecl = $module_decls[$selected_module_id];
 //$: console.log('selectedModuleDecl: ', selectedModuleDecl);

 onMount(() => {
  console.log('+page onMount');
  if ($sidebarSize) {
   setSidebarSize($sidebarSize);
  }
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
 });

 function updateAppHeight() {
  //console.log('updateAppHeight');

  if ('virtualKeyboard' in navigator) {
   navigator.virtualKeyboard.addEventListener('geometrychange', event => {
    //console.log('virtualKeyboard geometrychange:', event.target.boundingRect);
   });
  }

  const visualViewport = window.visualViewport;
  let viewportHeight;
  if (visualViewport) {
   viewportHeight = visualViewport.height;
   let clientHeight = visualViewport.clientHeight;
   //console.log('clientHeight:', clientHeight);
   let keyboardHeightValue = viewportHeight - clientHeight;
   //console.log('keyboardHeightValue:', keyboardHeightValue);
   if (keyboardHeightValue < 0) keyboardHeightValue = 0;
   keyboardHeight.set(keyboardHeightValue);
  } else viewportHeight = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  const metaViewport = document.querySelector('meta[name="viewport"]');
  if (metaViewport) metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content');
  documentHeight.set(document.documentElement.clientHeight);
  isMobile.set(window.matchMedia('(max-width: 768px)').matches);
  //console.log('window.innerHeight:', window.innerHeight);
  //console.log('viewportHeight:', viewportHeight);
  //console.log('document.documentElement.clientHeight:', document.documentElement.clientHeight);
  //console.log('$isMobile:', $isMobile);
 }

 let px_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;

 window.addEventListener('resize', () => {
  var newPx_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
  if (newPx_ratio != px_ratio) {
   px_ratio = newPx_ratio;
   //console.log('zooming: ', px_ratio);
   return true;
  } else {
   //console.log('just resizing, px_ratio: ', px_ratio);
   return false;
  }
 });

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
  console.log('startResizeSideBar');
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
  setSidebarSize(sideBar.clientWidth);
  sidebarSize.set(sideBar.clientWidth);
 }

 function resizeSideBar(e) {
  if (isResizingSideBar) {
   e.preventDefault();
   // delta from mouse move
   let delta = e.clientX - sideBar.clientWidth;
   setSidebarSize(sideBar.clientWidth + delta);
  }
 }

 let sidebarWidth;

 function setSidebarSize(width) {
  const max = 700;
  const min = 200;
  let sideBarWidth = Math.min(Math.max(width, min), max);
  sideBar.style.minWidth = sideBarWidth + 'px';
  sideBar.style.maxWidth = sideBarWidth + 'px';
  resizer.style.left = sideBarWidth + 'px';
 }

 isMobile.subscribe(v => {
  console.log('isMobile: ', v);
  if (v) {
   sidebarWidth = '';
  } else {
   sidebarWidth = ($sidebarSize || 300) + 'px';
  }
 });

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
  /*  min-width: 300px;
  max-width: 300px;*/
  max-height: 100%;
  box-shadow: var(--shadow);
  background-color: #fff;
 }

 .resizer {
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  /*left: 300px;*/
  width: 5px;
  cursor: ew-resize;
  background-color: #0d0;
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

  .sidebar.hidden-on-mobile {
   display: none;
  }

  .resizer {
   /*display: none;*/
  }
 }
</style>

<svelte:window {onkeydown} />
<svelte:head>
 <title>{product}</title>
</svelte:head>
<div class="app">
 <div class="sidebar {$hideSidebarMobile ? 'hidden-on-mobile' : ''}" style:min-width={sidebarWidth} style:max-width={sidebarWidth} style:width={sidebarWidth} bind:this={sideBar}>
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

 <div class="resizer" style:left={sidebarWidth} role="none" bind:this={resizer} on:mousedown={startResizeSideBar}></div>

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
