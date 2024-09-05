<script>
 import { onMount } from 'svelte';
 export let openNewConversation;
 export let onClose;
 let address;

 onMount(() => address.focus());

 function clickOpen() {
  if (address.value) {
   openNewConversation(address.value);
   onClose();
  }
 }

 function keyOpen() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickOpen();
  }
 }

 function keyEnter() {
  if (event.key === 'Enter') {
   event.preventDefault();
   clickOpen();
  }
 }
</script>

<style>
 .group {
  display: flex;
  align-items: center;
  gap: 10px;
 }

 .group .label {
  font-size: 15px;
  padding-left: 5px;
  font-weight: bold;
 }
</style>

<div class="group">
 <div class="label">Address:</div>
 <div><input type="text" placeholder="user@domain.tld" on:keydown={keyEnter} bind:this={address} /></div>
 <div class="button" role="button" tabindex="0" on:click={clickOpen} on:keydown={keyOpen}>Open</div>
</div>
