<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let visible = true;
 export let direction = false;
 export let left;
 export let right;
 export let top;
 export let bottom;
 export let onClick;
 let size = 30;
</script>

<style>
 .scroll-button {
  z-index: 1000;
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
 }

 .scroll-button img {
  width: 32px;
  height: 32px;
 }
</style>

{#if visible}
 <BaseButton {onClick}>
  <div class="scroll-button" style="--size: {size}px; {top ? 'top: ' + top + ';' : ''} {bottom ? 'bottom: ' + bottom + ';' : ''} {left ? 'left: ' + left + ';' : ''} {right ? 'right: ' + right + ';' : ''}">
   <img src="img/caret-{direction ? 'up' : 'down'}-gray.svg" alt={direction ? '˄' : '˅'} />
  </div>
 </BaseButton>
{/if}
