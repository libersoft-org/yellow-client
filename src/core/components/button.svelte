<script>
 import BaseButton from './base-button.svelte';
 export let img = '';
 export let text = '';
 export let enabled = true;
 export let hiddenOnDesktop = false;
 export let width;
 export let onClick;
 export let onTouchEnd;
 export let padding = '10px';
 export let bgColor = '#fd1';
 export let borderColor = '#b90';
 export let textColor = '#000';
 export let expand = false;

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
  border-radius: 10px;
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

<BaseButton onClick={handleClick} {onTouchEnd}>
 <div class="button {!enabled ? 'disabled' : ''} {hiddenOnDesktop ? 'hidden-on-desktop' : ''}" style={(width ? 'width: ' + width + ';' : '') + 'padding: ' + padding + ';'} style:background-color={bgColor} style:color={textColor} style:border-color={borderColor} style:flex={expand ? 1 : 0}>
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
