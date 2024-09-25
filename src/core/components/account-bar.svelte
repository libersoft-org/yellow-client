<script>
 import { onMount, onDestroy } from 'svelte';
 import { account, accounts, selectAccount }  from '../core.js';

 let accountsVisible = false;

 let dropdown;

 function clickToggleAccounts() {
   accountsVisible = !accountsVisible;
   if (accountsVisible) document.addEventListener('click', handleClickOutside);
   else document.removeEventListener('click', handleClickOutside);
 }

 function keyToggleAccounts() {
  console.log('event.key: ' + event.key);
  if (event.key === 'Enter' || event.key === ' ') {
   clickToggleAccounts();
   event.preventDefault();
  }
  else if (event.key === 'Escape') {
   accountsVisible = true;
   clickToggleAccounts();
   event.preventDefault();
  }
 }

 function clickSelectAccount(id) {
  selectAccount(id);
  console.log('accountsVisible: ' + accountsVisible);
  accountsVisible = false;
  console.log('accountsVisible: ' + accountsVisible);
  console.log('Selected account: ' + $account.title);
  document.removeEventListener('click', handleClickOutside);
 }

 function keySelectAccount(id, event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   event.stopPropagation();
   clickSelectAccount(id);
  }
 }

 function handleClickOutside(event) {
  if (dropdown && !dropdown.contains(event.target)) {
   accountsVisible = false;
   document.removeEventListener('click', handleClickOutside);
  }
 }

 onDestroy(() => {
  document.removeEventListener('click', handleClickOutside);
 });
</script>

<style>
 .dropdown {
  display: flex;
  align-items: center;
  padding: 10px;
  font-weight: bold;
  border-bottom: 1px solid #555;
  background-color: #222;
  color: #fff;
  cursor: pointer;
  position: relative;
 }

 .dropdown .text {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex-grow: 1;
 }

 .dropdown img {
  width: 20px;
  height: 20px;
 }

 .items {
  display: none;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #333;
  z-index: 1000;
  width: 100%;
 }

 .items.open {
  display: flex;
 }

 .items .item {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 10px;
  color: #fff;
  cursor: pointer;
}

 .items .item:hover {
  background-color: #222;
 }
</style>

<div class="dropdown" role="button" tabindex="0" on:click={clickToggleAccounts} on:keydown={keyToggleAccounts} bind:this={dropdown}>
 <div class="text">{account.title}</div>
 <div><img src="img/down.svg" alt="▼" /></div>
 {#if accountsVisible}
  <div class="items open">
   {#each accounts as a (a.id)}
    <div class="item" role="button" tabindex="0" on:click={() => clickSelectAccount(a.id) } on:keydown={(event) => keySelectAccount(a.id, event)}>{a.title}</div>
   {/each}
  </div>
 {/if}
</div>
