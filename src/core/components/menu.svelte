<script>
 /*import Core from '../core.js';*/
 import Item from './menu-item.svelte';
 export let showMenu = false;
 export let product;
 export let version;
 export let link;

 /*
 function logout() {
  Core.hideSidebarMobile.update(() => false);
  showMenu = false;
 }
 */

 function clickMenuClose() {
  showMenu = false;
 }

 function keyMenuClose(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickMenuClose();
  }
 }

 function clickLogo() {
  window.open(link, '_blank');
 }

 function keyLogo(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickLogo();
  }
 }

 function clickSettings() {
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

 .menu.open {
  transform: translateX(0);
  transition:
   transform 0.3s ease,
   visibility 0s;
  visibility: visible;
 }

 .top {
  display: flex;
  border-bottom: 1px solid #444;
 }

 .top .icon {
  display: flex;
  padding: 15px;
  cursor: pointer;
 }

 .top .icon img {
  width: 30px;
  height: 30px;
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
  cursor: pointer;
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
 <div class="overlay open" role="none" on:click={clickMenuClose}></div>
{/if}
<div class="menu {showMenu ? 'open' : ''}">
 <div>
  <div class="top">
   <div class="icon" role="button" tabindex="0" on:click={clickMenuClose} on:keydown={keyMenuClose}><img src="img/close.svg" alt="X" /></div>
  </div>
  <Item img="img/settings.svg" title="Settings" on:click={clickSettings} />
 </div>
 <div class="footer">
  <div class="logo" role="button" tabindex="0" on:click={clickLogo} on:keydown={keyLogo}>
   <div><img src="img/logo.svg" alt={product} /></div>
   <div>{product}</div>
  </div>
  <div class="version">
   <div>Version:</div>
   <div class="bold">{version}</div>
  </div>
 </div>
</div>
