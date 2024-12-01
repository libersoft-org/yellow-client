<script>
 import { hideSidebarMobile } from '../../../core/core.js';
 import { addressBook } from '../wallet.ts';

 function clickShowWallet() {
  hideSidebarMobile.set(true);
 }

 function keyShowWallet() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickShowWallet();
  }
 }

 function clickItem(address) {
  console.log('SIDEBAR ADDRESS ITEM:', address);
  //hideSidebarMobile.set(true);
 }

 function keyItem(address) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickItem(address);
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

 .addressbook {
  overflow: auto;
 }

 .items .item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 1px solid #dd9;
  background-color: #fde990;
  cursor: pointer;
 }

 .items .item:hover {
  background-color: #fd1;
 }

 .items .item .alias {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-weight: bold;
 }

 .items .item .address {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 12px;
  color: #555;
 }

 @media (min-width: 769px) {
  .content-button {
   display: none;
  }
 }
</style>

<div class="content-button" role="button" tabindex="0" on:click={clickShowWallet} on:keydown={keyShowWallet}>Show wallet</div>
<div class="addressbook">
 {#if $addressBook.length > 0}
  <div class="items">
   {#each $addressBook as a, index}
    <div class="item {index % 2 === 0 ? 'even' : 'odd'}" role="button" tabindex="0" on:click={() => clickItem(a.address)} on:keydown={() => keyItem(a.address)}>
     <div class="alias">{a.alias}</div>
     <div class="address">{a.address}</div>
    </div>
   {/each}
  </div>
 {/if}
</div>
