<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import { getColorFromCSSToFilter } from '../../utils/colors.js';

 let {
  img,
  alt = '',
  size = 24,
  padding = 10,
  visibleOnMobile = true,
  visibleOnDesktop = true,
  colorVariable,
  onClick,
 } = $props()
</script>

<style>
 .icon {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
 }

 .icon img {
  display: flex;
 }

 @media (max-width: 767px) {
  .hideOnMobile {
   display: none;
  }
 }

 @media (min-width: 768px) {
  .hideOnDesktop {
   display: none;
  }
 }
</style>

{#snippet icon()}
 <div class="icon {visibleOnMobile ? '' : 'hideOnMobile'} {visibleOnDesktop ? '' : 'hideOnDesktop'}" style="padding: {padding}px;">
  <img style="width: {size}px; height: {size}px; {colorVariable && 'filter: ' + getColorFromCSSToFilter(colorVariable) + ';'}" src={img} {alt} />
 </div>
{/snippet}

{#if img}
 {#if onClick}
  <BaseButton {onClick}>
   {@render icon()}
  </BaseButton>
 {:else}
  {@render icon()}
 {/if}
{/if}
