<script>
 import { onMount, onDestroy } from 'svelte';
 let accountsArray = [
  { id: 1, title: 'user@user.com (AMTP)' },
  { id: 2, title: 'jinejuser@jinejuser.com (AMTP)' },
  { id: 3, title: '1a2b3c4d5e6f7a8b9c0d1f2a3b4c5d6e7f8a9b0c1d2e3f (DMTP)' },
 ];
 let accountsVisible = false;
 let selectedAccount = accountsArray[0];
 let dropdown;

 onMount(() => {
  selectAccount(1);
 });

 function toggleAccounts() {
   accountsVisible = !accountsVisible;
   if (accountsVisible) document.addEventListener('click', handleClickOutside);
   else document.removeEventListener('click', handleClickOutside);
 }

 function selectAccount(id) {
  selectedAccount = accountsArray.find(a => a.id === id);
  accountsVisible = false;
  document.removeEventListener('click', handleClickOutside);
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

<div class="dropdown" role="button" tabindex="0" on:click={toggleAccounts} bind:this={dropdown}>
 <div class="text">{selectedAccount.title}</div>
 <div><img src="img/down.svg" /></div>
 {#if accountsVisible}
  <div class="items open">
   {#each accountsArray as a (a.id)}
    <div class="item" role="button" tabindex="0" on:click={() => selectAccount(a.id)}>{a.title}</div>
   {/each}
  </div>
 {/if}
</div>
