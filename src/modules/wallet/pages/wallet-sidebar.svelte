<script>
 import { hideSidebarMobile } from '../../../core/core.js';

 function clickShowWallet() {
  hideSidebarMobile.set(true);
 }

 function keyShowWallet() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickShowWallet();
  }
 }
</script>

<style>
 .content-button {
  padding: 10px;
  font-weight: bold;
  background-color: #222;
  color: #fff;
  cursor: pointer;
 }

 @media (min-width: 769px) {
  .content-button {
   display: none;
  }
 }
</style>

<div class="content-button" role="button" tabindex="0" on:click={clickShowWallet} on:keydown={keyShowWallet}>Show wallet</div>
<div>Wallet sidebar - not yet implemented</div>
