<script>
 import BaseButton from '../Button/BaseButton.svelte';
 import { getColorFromCSSToFilter } from '../../utils/colors.js';
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
 export let imgSize = '24px';
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
   <img style="width: {imgSize}; height: {imgSize}; {colorVariable && 'filter: ' + getColorFromCSSToFilter(colorVariable) + ';'}" src={img} alt={title} />
  {/if}
  {#if title}
   <div>{title}</div>
  {/if}
 </div>
</BaseButton>
