<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let img;
 export let alt = '';
 export let hiddenOnDesktop = false;
 export let onClick;
</script>

<style>
 .button {
  display: flex;
 }

 .button img {
  width: 32px;
  height: 32px;
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
   <img src={img} {alt} />
  </div>
 </BaseButton>
{/if}
