<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import { getColorFromCSSToFilter } from '../../utils/colors.js';
 export let img;
 export let alt = '';
 export let size = 24;
 export let padding = 10;
 export let visibleOnMobile = true;
 export let visibleOnDesktop = true;
 export let colorVariable;
 export let onClick;
</script>

<style>
 .icon {
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

{#if img}
 {#if onClick}
  <BaseButton {onClick}>
   <div class="icon {visibleOnMobile ? '' : 'hideOnMobile'} {visibleOnDesktop ? '' : 'hideOnDesktop'}" style="padding: {padding}px;">
    <img style="width: {size}px; height: {size}px; {colorVariable && 'filter: ' + getColorFromCSSToFilter(colorVariable)};" src={img} {alt} />
   </div>
  </BaseButton>
 {:else}
  <!-- TODO - convert this to Svelte 5 snippet -->
  <div class="icon {visibleOnMobile ? '' : 'hideOnMobile'} {visibleOnDesktop ? '' : 'hideOnDesktop'}" style="padding: {padding}px;">
   <img style="width: {size}px; height: {size}px; {colorVariable && 'filter: ' + getColorFromCSSToFilter(colorVariable)};" src={img} {alt} />
  </div>
 {/if}
{/if}
