<script>
 import BaseButton from './base-button.svelte';
 import Item from './menu-item.svelte';
 import Modal from './modal.svelte';
 import ModalSettings from '../modals/settings.svelte';
 import { product, version, build, commit, link } from '../core.js';
 export let showMenu = false;
 export let showModalSettings = false;

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

 .header .icon {
  display: flex;
  padding: 15px;
 }

 .header .icon img {
  width: 30px;
  height: 30px;
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
  gap: 5px;
  font-size: 18px;
  font-weight: bold;
 }

 .footer .logo img {
  width: 20px;
  height: 20px;
 }

 .footer .version {
  display: flex;
  justify-content: center;
  gap: 5px;
  font-size: 14px;
 }
</style>

{#if showMenu}
 <div class="overlay open" role="none" onclick={clickMenuClose}></div>
{/if}
<div class="menu {showMenu ? 'open' : ''}">
 <div>
  <div class="header">
   <BaseButton onClick={clickMenuClose}>
    <div class="icon">
     <img src="img/close.svg" alt="X" />
    </div>
   </BaseButton>
  </div>
  <div class="items">
   <Item img="img/donate.svg" title="Donate" onClick={() => openPage('https://libersoft.org/donations')} />
   <Item img="img/contact.svg" title="Contact developers" onClick={() => openPage('https://libersoft.org/contacts')} />
   <Item img="img/settings.svg" title="Settings" onClick={clickSettings} />
  </div>
 </div>
 <div class="footer">
  <BaseButton onClick={() => openPage(link)}>
   <div class="logo">
    <div><img src="img/logo.svg" alt={product} /></div>
    <div>{product}</div>
   </div>
  </BaseButton>
  <div class="version">
   <div>Version:</div>
   <div class="bold">{version}</div>
  </div>
  <div class="version">
   <div>Build:</div>
   <div class="bold">{build}</div>
  </div>
  <div class="version">
   <div>Commit:</div>
   <div class="bold">{commit}</div>
  </div>
 </div>
</div>
<Modal title="Settings" body={ModalSettings} bind:show={showModalSettings} width="500px" />
