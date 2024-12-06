<script>
 import { createEventDispatcher, onMount } from 'svelte';
 export let visible = true;
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
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  right: 20px;
  bottom: 70px;
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
 <div class="scroll-down" style="--size: {size}px;" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
  <img src="img/caret-down-gray.svg" alt="˅" />
 </div>
{/if}
