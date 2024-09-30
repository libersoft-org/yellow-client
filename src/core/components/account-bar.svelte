<script>
 import { onMount, onDestroy } from 'svelte';
 import { get } from "svelte/store";
 import { active_account, accounts, selectAccount, selected_corepage_id, hideSidebarMobile }  from '../core.js';
 import AccountBarItem from './account-bar-item.svelte';
 import AccountBarButton from './account-bar-button.svelte';
 let accountsVisible = false;
 let dropdown;


 onDestroy(() => {
  document.removeEventListener('click', handleClickOutside);
 });

 // $: console.log('account-bar.svelte: account: ', $active_account);
 // $: console.log('account-bar.svelte: accounts: ', $accounts);
 // $: console.log('accountsVisible: ', accountsVisible);

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
  //console.log('clickSelectAccount: ' + id);
  selectAccount(id);
  //console.log('accountsVisible: ' + accountsVisible);
  accountsVisible = false;
  //console.log('accountsVisible: ' + accountsVisible);
  document.removeEventListener('click', handleClickOutside);
 }

 function handleClickOutside(event) {
  if (dropdown && !dropdown.contains(event.target)) {
   accountsVisible = false;
   document.removeEventListener('click', handleClickOutside);
  }
 }

 function clickAccountManagement() {
  selected_corepage_id.set('accounts');
  hideSidebarMobile.set(true);
 }
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
</style>

<div class="dropdown" role="button" tabindex="0" on:click={clickToggleAccounts} on:keydown={keyToggleAccounts} bind:this={dropdown}>
 <div class="text">{$active_account?.settings?.title || 'CREATE ACCOUNT FIRST'}</div>
 <div><img src="img/down.svg" alt="▼" /></div>
 {#if accountsVisible}
  <div class="items open">
   {#each $accounts as a (get(a).id)}
    <AccountBarItem {a} {clickSelectAccount} />
   {/each}
   <AccountBarButton img="img/accounts.svg" title="Account management" click={clickAccountManagement} />
  </div>
 {/if}
</div>
