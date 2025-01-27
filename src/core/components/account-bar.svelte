<script>
 import { onDestroy } from 'svelte';
 import { get } from 'svelte/store';
 import { debug, active_account, accounts, selectAccount, selected_corepage_id, hideSidebarMobile } from '../core.js';
 import BaseButton from './base-button.svelte';
 import AccountBarItem from './account-bar-item.svelte';
 import AccountBarButton from './account-bar-button.svelte';
 import AccountStatusIcon from './account-status-icon.svelte';
 import AccountTitle from './account-title.svelte';
 let accountsVisible = false;
 let dropdown;

 onDestroy(() => {
  document.removeEventListener('click', handleClickOutside);
 });

 //$: console.log('account-bar.svelte: account: ', $active_account);
 //$: console.log('account-bar.svelte: accounts: ', $accounts);
 //$: console.log('accountsVisible: ', accountsVisible);

 function clickToggleAccounts() {
  accountsVisible = !accountsVisible;
  if (accountsVisible) {
   if (!$debug) {
    document.addEventListener('click', handleClickOutside);
   }
  } else document.removeEventListener('click', handleClickOutside);
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
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  font-weight: bold;
  border-bottom: 1px solid #555;
  background-color: #222;
  color: #fff;
 }

 .dropdown .text {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  min-width: 0;
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

<BaseButton onClick={clickToggleAccounts}>
 <div class="dropdown" bind:this={dropdown}>
  {#if $active_account}
   <div class="text">
    <AccountStatusIcon account={active_account} />
    <AccountTitle a={active_account} />
   </div>
  {:else}
   {#if $accounts.length > 0}
    <div class="text">SELECT YOUR ACCOUNT</div>
   {/if}
   {#if $accounts.length == 0}
    <div class="text">CREATE ACCOUNT FIRST</div>
   {/if}
  {/if}
  <div>
   <img src={accountsVisible ? 'img/up.svg' : 'img/down.svg'} alt={accountsVisible ? '▲' : '▼'} />
  </div>
  {#if accountsVisible}
   <div class="items open">
    {#each $accounts as a (get(a).id)}
     <AccountBarItem {a} {clickSelectAccount} />
    {/each}
    <AccountBarButton img="img/accounts.svg" title="Account management" onClick={clickAccountManagement} />
   </div>
  {/if}
 </div>
</BaseButton>
