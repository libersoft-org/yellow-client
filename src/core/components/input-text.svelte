<script>
 import { createEventDispatcher } from 'svelte';
 export let password = false;
 export let placeholder = '';
 export let value = '';
 const dispatch = createEventDispatcher();
 let inputEl;

 function handleKeydown(e) {
  dispatch('keydown', e);
 }

 export function focus() {
  inputEl?.focus();
 }
</script>

<style>
 input {
  padding: 10px;
  border: 1px solid #999;
  border-radius: 10px;
 }
</style>

<input type={password ? 'password' : 'text'} {placeholder} bind:this={inputEl} bind:value on:keydown={handleKeydown} />
