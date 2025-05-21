<script lang="ts">
 import Icon from '../Icon/Icon.svelte';
 import MenuBarDebug from './MenuBarDebug.svelte';
 import { product } from '../../core.js';

 type Props = {
  isMenuOpen: boolean;
 };

 let { isMenuOpen = $bindable() }: Props = $props();

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

 .product {
  font-size: 22px;
  font-weight: bold;
 }
</style>

<div class="bar">
 <Icon img="img/menu.svg" alt="☰" colorVariable="--icon-black" size="30px" padding="10px" onClick={handleClick} />
 <div class="product">{product}</div>
 <MenuBarDebug />
</div>
