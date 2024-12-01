<script>
 import { onMount } from 'svelte';
 import { openNewConversation } from '../messages.js';
 import Button from '../../../core/components/button.svelte';
 export let close;
 export let params;
 let address;

 onMount(() => address.focus());

 function clickOpen() {
  if (address.value) {
   openNewConversation(address.value);
   console.log('close();');
   close();
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
 <Button on:click={clickOpen}>Open</Button>
</div>
