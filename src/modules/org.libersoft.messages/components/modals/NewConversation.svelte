<script>
 import { onMount } from 'svelte';
 import { openNewConversation } from '../../messages.js';
 import Button from '@/core/components/Button/Button.svelte';
 import Input from '../../../../core/components/Input/Input.svelte';
 export let close;
 let elAddress;
 let value;

 onMount(() => elAddress.focus());

 function clickOpen() {
  console.log('clickOpen(); address.value:', value);
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
 <Input placeholder="user@domain.tld" onKeydown={keyEnter} bind:this={elAddress} bind:value />
 <Button text="Open" onClick={clickOpen} />
</div>
