<script>
 import Sticker from './sticker.svelte';
 import { createEventDispatcher, getContext } from 'svelte';
 export let file;
 const dispatch = createEventDispatcher();
 let menu = getContext('ContextMenu');

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   trigger();
  }
 }

 function click() {
  trigger();
 }

 function trigger() {
  console.log('trigger');
  dispatch('click');
  menu.close();
 }

 function mousedown(event) {
  console.log('sticker-set-item mousedown');
  event.preventDefault();
  event.stopPropagation();
 }
</script>

<style>
 .link {
  cursor: pointer;
 }
</style>

{#if file}
 <div class="link" role="button" tabindex="0" on:mousedown={mousedown} on:click={click} on:keydown={handleKeydown}>
  <Sticker {file} size="80" />
 </div>
{/if}
