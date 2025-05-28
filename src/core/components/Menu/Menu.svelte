<script lang="ts">
 import BaseButton from '../Button/BaseButton.svelte';
 import MenuItem from './MenuItem.svelte';
 import Modal from '../Modal/Modal.svelte';
 import ModalSettings from '../../modals/Settings/Settings.svelte';
 import Icon from '../Icon/Icon.svelte';
 import DialogExit from '../../dialogs/Exit.svelte';
 import VersionInfo from '../VersionInfo/VersionInfo.svelte';
 import { product, link } from '../../core.js';
 import { TAURI, BROWSER } from '@/core/tauri.ts';

 type Props = {
  showMenu: boolean;
  showModalSettings: boolean;
 };

 let { showMenu = $bindable(false), showModalSettings = false }: Props = $props();
 let elDialogExit: InstanceType<typeof DialogExit>;

 //  let native_client_commit;
 //  let native_client_build_ts;

 const menuItems = [
  {
   title: 'Donate',
   img: 'img/donate.svg',
   onClick: () => openPage('https://libersoft.org/donations'),
  },
  {
   title: 'Contact developers',
   img: 'img/contact.svg',
   onClick: () => openPage('https://libersoft.org/contacts'),
  },
  {
   title: 'Settings',
   img: 'img/settings.svg',
   onClick: clickSettings,
  },
 ].concat(
  BROWSER
   ? []
   : [
      {
       title: 'Exit application',
       img: 'img/exit.svg',
       onClick: exitApp,
      },
     ]
 );

 function clickMenuClose() {
  showMenu = false;
 }

 function openPage(url) {
  window.open(url, '_blank');
  clickMenuClose();
 }

 function clickSettings() {
  showModalSettings = true;
  clickMenuClose();
 }

 function exitApp() {
  elDialogExit.open();
  clickMenuClose();
 }
</script>

<style>
 .overlay {
  z-index: 999;
  position: fixed;
  display: none;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
 }

 .overlay.open {
  display: block;
 }

 .menu {
  z-index: 1000;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #222;
  color: #fff;
  box-shadow: var(--shadow);
  transform: translateX(-100%);
  transition:
   transform 0.3s ease,
   visibility 0s 0.3s;
  visibility: hidden;
 }

 .menu > div:first-child {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
 }

 .menu.open {
  transform: translateX(0);
  transition:
   transform 0.3s ease,
   visibility 0s;
  visibility: visible;
 }

 .header {
  display: flex;
  border-bottom: 1px solid #444;
 }

 .items {
  overflow: auto;
  flex: 1;
  min-height: 0;
 }

 .footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  text-align: center;
  color: #ccc;
  border-top: 1px solid #444;
 }

 .footer .logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 22px;
  font-weight: bold;
 }

 .footer :global(.menu-version-info .version) {
  justify-content: center;
  font-size: 14px;
 }
</style>

{#if showMenu}
 <div class="overlay open" role="none" onclick={clickMenuClose}></div>
{/if}
<div class="menu {showMenu ? 'open' : ''}">
 <div>
  <div class="header">
   <Icon img="img/close.svg" alt="X" colorVariable="--icon-white" size="30px" padding="15px" onClick={clickMenuClose} />
  </div>
  <div class="items">
   {#each menuItems as item}
    <MenuItem img={item.img} title={item.title} colorVariable="--icon-white" onClick={item.onClick} />
   {/each}
  </div>
 </div>
 <div class="footer">
  <BaseButton onClick={() => openPage(link)}>
   <div class="logo">
    <Icon img="img/logo.svg" alt={product} size="30px" padding="0px" />
    <div>{product}</div>
   </div>
  </BaseButton>
  <VersionInfo className="menu-version-info" />
 </div>
</div>
<Modal title="Settings" body={ModalSettings} bind:show={showModalSettings} width="500px" />
<DialogExit bind:this={elDialogExit} />
