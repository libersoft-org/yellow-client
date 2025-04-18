<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 export let img;
 export let alt = '';
 export let hiddenOnDesktop = false;
 export let onClick;
 export let colorVariable;
</script>

<style>
 .button {
  display: flex;
 }

 @media (min-width: 769px) {
  .button.hidden {
   display: none;
  }
 }
</style>

{#if img}
 <BaseButton {onClick}>
  <div class="button {hiddenOnDesktop ? 'hidden' : ''}">
   <Icon {img} {alt} {colorVariable} size="32" padding="0" />
  </div>
 </BaseButton>
{/if}
