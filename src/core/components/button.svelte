<script>
 import BaseButton from './base-button.svelte';
 export let img = '';
 export let text = '';
 export let enabled = true;
 export let hiddenOnDesktop = false;
 export let width;
 export let onClick;
 export let padding = '10px';

 function handleClick(e) {
  if (enabled) onClick(e);
 }
</script>

<style>
 .button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-align: center;
  border: 1px solid #b90;
  border-radius: 10px;
  background-color: #fd1;
  font-weight: bold;
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

<BaseButton onClick={handleClick}>
 <div class="button {!enabled ? 'disabled' : ''} {hiddenOnDesktop ? 'hidden-on-desktop' : ''}" style={(width ? 'width: ' + width + ';' : '') + 'padding: ' + padding + ';'}>
  <slot>
   {#if img}
    <img src={img} alt={text} />
   {/if}
   {#if text}
    <div>{text}</div>
   {/if}
  </slot>
 </div>
</BaseButton>
