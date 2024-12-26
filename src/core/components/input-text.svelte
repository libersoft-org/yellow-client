<script>
 import { createEventDispatcher } from 'svelte';
 export let password = false;
 export let placeholder = '';
 export let value = '';
 const dispatch = createEventDispatcher();
 let elInput;

 function handleKeydown(e) {
  dispatch('keydown', e);
 }

 export function focus() {
  elInput?.focus();
 }
</script>

<style>
 input {
  padding: 10px;
  border: 1px solid #999;
  border-radius: 10px;
  font-family: inherit;
  font-size: inherit;
 }
</style>

<input type={password ? 'password' : 'text'} {placeholder} bind:this={elInput} bind:value on:keydown={handleKeydown} />
