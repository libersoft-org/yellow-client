<script>
 import { createEventDispatcher } from 'svelte';
 export let visible = true;
 const dispatch = createEventDispatcher();

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
  min-width: 38px;
  width: 38px;
  min-height: 38px;
  height: 38px;
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
 <div class="scroll-down" role="button" tabindex="0" on:click on:keydown={handleKeydown}>
  <img src="img/caret-down-gray.svg" alt="˅" />
 </div>
{/if}
