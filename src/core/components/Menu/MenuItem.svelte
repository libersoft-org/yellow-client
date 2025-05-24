<script>
 import BaseButton from '../Button/BaseButton.svelte';
 import Icon from '../Icon/Icon.svelte';
 export let img;
 export let title;
 export let onClick;
 export let padding = '15px 20px';
 export let gap = '20px';
 export let bgColor = '#222';
 export let textColor = '#fff';
 export let hoverColor = '#333';
 export let borderTop = 'none';
 export let borderBottom = '1px solid #444';
 export let borderLeft = 'none';
 export let borderRight = 'none';
 export let borderRadius = '0';
 export let colorVariable;
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
 <div class="item" style="padding: {padding}; gap: {gap}; color: {textColor}; --bgColor: {bgColor}; border-top: {borderTop}; border-bottom: {borderBottom}; border-left: {borderLeft}; border-right: {borderRight}; --hoverColor: {hoverColor}; border-radius: {borderRadius}">
  {#if img}
   <Icon {img} alt={title} {colorVariable} size="24px" padding="0px" />
  {/if}
  {#if title}
   <div>{title}</div>
  {/if}
 </div>
</BaseButton>
