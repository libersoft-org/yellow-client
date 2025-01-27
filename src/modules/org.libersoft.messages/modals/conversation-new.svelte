<script>
 import { onMount } from 'svelte';
 import { openNewConversation } from '../messages.js';
 import Button from '../../../core/components/button.svelte';
 import InputText from '../../../core/components/input-text.svelte';
 export let close;
 let address;
 let value;

 onMount(() => address.focus());

 function clickOpen() {
  console.log('clickOpen(); address.value:', address.value);
  if (value) {
   openNewConversation(value);
   console.log('close();');
   close();
  }
 }

 function keyEnter(event) {
  console.log('keyEnter(); event:', event);
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
 <InputText placeholder="user@domain.tld" onKeydown={keyEnter} bind:this={address} bind:value />
 <Button text="Open" onClick={clickOpen} />
</div>
