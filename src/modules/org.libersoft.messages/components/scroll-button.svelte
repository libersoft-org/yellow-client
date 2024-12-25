<script>
 import { createEventDispatcher, onMount } from 'svelte';
 export let visible = true;
 export let direction = false;
 export let left;
 export let right;
 export let top;
 export let bottom;
 const dispatch = createEventDispatcher();
 let size = 30;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   dispatch('click');
  }
 }
</script>

<style>
 .scroll-down {
  z-index: 100;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--size);
  width: var(--size);
  min-height: var(--size);
  height: var(--size);
  padding: 10px;
  border: 2px solid #aaa;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: var(--shadow);
  cursor: pointer;
 }

 .scroll-down img {
  width: 32px;
  height: 32px;
 }
</style>

{#if visible}
 <div class="scroll-down" style="--size: {size}px; {top ? 'top: ' + top + ';' : ''} {bottom ? 'bottom: ' + bottom + ';' : ''} {left ? 'left: ' + left + ';' : ''} {right ? 'right: ' + right + ';' : ''}" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
  <img src="img/caret-{direction ? 'up' : 'down'}-gray.svg" alt={direction ? '˄' : '˅'} />
 </div>
{/if}
