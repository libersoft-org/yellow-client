<script>
 import { createEventDispatcher } from 'svelte';
 export let img = '';
 export let text = '';
 export let enabled = true;
 export let hiddenOnDesktop = false;
 export let width;
 const dispatch = createEventDispatcher();

function handleClick() {
  if (enabled) dispatch('click');
 }

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   if (enabled)
    dispatch('click');
  }
 }
</script>

<style>
 .button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-align: center;
  padding: 10px;
  border: 1px solid #b90;
  border-radius: 10px;
  background-color: #fd1;
  font-weight: bold;
  cursor: pointer;
 }

 .button.disabled {
  border: 1px solid #888;
  background-color: #bbb;
 }

 .button img {
  width: 20px;
  height: 20px;
 }

 @media (min-width: 769px) {
  .hidden-on-desktop {
   display: none;
  }
 }
</style>

<div class="button {!enabled ? 'disabled' : ''} {hiddenOnDesktop ? 'hidden-on-desktop' : ''}" style={width ? 'width: ' + width : ''} role="button" tabindex="0" on:click={handleClick} on:keydown={handleKeydown}>
 <slot>
  {#if img}
   <img src={img} alt={text} />
  {/if}
  <div>{text}</div>
 </slot>
</div>
