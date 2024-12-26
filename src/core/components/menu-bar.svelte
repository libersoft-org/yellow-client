<script>
 import BaseButton from './base-button.svelte';
 import { product, debug } from '../core.js';
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
 {#if $debug}(debug mode){/if}
</div>
