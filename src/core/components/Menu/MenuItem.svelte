<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 export let img;
 export let title;
 export let onClick;
 export let padding = '15px 20px';
 export let gap = '20px';
 export let bgColor = '#222';
 export let textColor = '#fff';
 export let hoverColor = '#333';
 export let borderColor = '#444';
 export let imgSize = '24px';
 export let borderRadius = '0';
</script>

<style>
 .item {
  display: flex;
  align-items: center;
  background-color: var(--bgColor);
 }

 .item:hover {
  background-color: var(--hoverColor);
 }
</style>

<BaseButton {onClick}>
 <div class="item" style="padding: {padding}; gap: {gap}; color: {textColor}; --bgColor: {bgColor}; border-bottom: 1px solid {borderColor}; --hoverColor: {hoverColor}; border-radius: {borderRadius}">
  {#if img}
   <img style="width: {imgSize}; height: {imgSize}" src={img} alt={title} />
  {/if}
  {#if title}
   <div>{title}</div>
  {/if}
 </div>
</BaseButton>
