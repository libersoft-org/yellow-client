<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import { product, debug } from '../../core.js';
 import { addNotification } from '../../notifications.ts';
 import { log } from '../../tauri.ts';

 export let isMenuOpen;

 function handleClick() {
  isMenuOpen = true;
 }
</script>

<style>
 .bar {
  display: flex;
  align-items: center;
  height: var(--menu-height);
  min-height: var(--menu-height);
  background-color: #fd1;
  color: #222;
 }

 .menu {
  display: flex;
  padding: 10px;
 }

 .menu img {
  width: 30px;
  height: 30px;
 }

 .product {
  font-size: 22px;
  font-weight: bold;
 }
</style>

<div class="bar">
 <BaseButton onClick={handleClick}>
  <div class="menu">
   <img src="img/menu.svg" alt="☰" />
  </div>
 </BaseButton>
 <div class="product">{product}</div>
 {#if $debug}(debug mode)
  <BaseButton
   onClick={async () => {
    //log.debug('addNotification...');
    await addNotification({
     body: 'bla bla',
     callback: event => {
      log.debug('debug notification callback ' + event);
     },
    });
   }}>addNotification</BaseButton
  >
 {/if}
</div>
