<script>
 import BaseButton from './base-button.svelte';
 export let img;
 export let alt = '';
 export let size = 24;
 export let padding = 10;
 export let visibleOnMobile = true;
 export let visibleOnDesktop = true;
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
 <BaseButton {onClick}>
  <div class="icon {visibleOnMobile ? '' : 'hideOnMobile'} {visibleOnDesktop ? '' : 'hideOnDesktop'}" style="padding: {padding}px;">
   <img style="width: {size}px; height: {size}px;" src={img} {alt} />
  </div>
 </BaseButton>
{/if}
