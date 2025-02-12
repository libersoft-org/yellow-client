<script>
 import BaseButton from './base-button.svelte';
 export let type = 'text';
 export let placeholder = '';
 export let value = '';
 export let img;
 export let alt = '';
 export let onClick;
 export let grow = false;
 export let minWidth;
 export let maxWidth;
 let elInput;

 function handleKeydown(e) {
  if (onKeydown) onKeydown(e);
 }

 export function focus() {
  elInput?.focus();
 }
</script>

<style>
 .input-button {
  display: flex;
  box-sizing: content-box;
  align-items: center;
  border: 1px solid #888;
  border-radius: 10px;
 }

 input {
  width: 100%;
  border: 0;
  border-radius: 10px;
  padding: 10px;
  font-family: inherit;
  font-size: inherit;
  outline: none;
 }

 input:focus {
  outline: 2px solid #0060df;
 }

 .image {
  padding: 10px;
 }

 .image img {
  display: flex;
  width: 20px;
  height: 20px;
 }
</style>

<div class="input-button" style:flex-grow={grow && '1'} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 22px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 22px)'}>
 <input {type} {placeholder} bind:this={elInput} bind:value on:keydown={e => handleKeydown(e)} />
 <BaseButton {onClick}>
  <div class="image">
   <img src={img} {alt} />
  </div>
 </BaseButton>
</div>
