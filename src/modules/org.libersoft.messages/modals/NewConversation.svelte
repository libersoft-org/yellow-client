<script lang="ts">
 import { onMount } from 'svelte';
 import { openNewConversation } from '../messages.js';
 import Button from '@/core/components/Button/Button.svelte';
 import Input from '@/core/components/Input/Input.svelte';
 import { m } from '@/lib/paraglide/messages.js';

 interface Props {
  close: () => void;
 }

 let { close }: Props = $props();

 let addressInputRef = $state<HTMLInputElement>();
 let value = $state('');

 onMount(() => addressInputRef?.focus());

 function clickOpen() {
  if (value) {
   openNewConversation(value);
   console.log('close();');
   close();
  }
 }

 function onSubmit(event) {
  event.preventDefault();
  clickOpen();
 }
</script>

<style>
 .group {
  display: flex;
  align-items: end;
  gap: 10px;
 }
</style>

<form onsubmit={onSubmit}>
 <div class="group">
  <Input label={`${m['messages.new_conversation.address']()}:`} grow placeholder="user@domain.tld" inputRef={addressInputRef} bind:value />
  <Button text={m['common.open']()} onClick={clickOpen} />
 </div>
</form>
