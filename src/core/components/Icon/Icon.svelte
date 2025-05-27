<script lang="ts">
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import { getColorFromCSSToFilter } from '../../utils/colors.js';
 import { selected_theme_index } from '../../appearance_store.js';

 interface Props {
  img: string;
  alt?: string;
  size?: string;
  padding?: string;
  visibleOnMobile?: boolean;
  visibleOnDesktop?: boolean;
  colorVariable?: string;
  onClick?: () => void;
  isButton?: boolean;
  'data-testid'?: string;
 }

let index = $selected_theme_index;

$effect(() => {
  selected_theme_index.subscribe(newValue => {
    
  });
  console.log("test icon");
});

 let { img, alt = '', size = '24px', padding = '10px', visibleOnMobile = true, visibleOnDesktop = true, colorVariable, onClick, isButton = false, 'data-testid': dataTestId }: Props = $props();
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
  user-select: none;
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
 <div class="icon {!visibleOnMobile && 'hideOnMobile'} {!visibleOnDesktop && 'hideOnDesktop'}" style="padding: {padding};">
  <img style="width: {size}; height: {size}; min-width: {size}; min-height: {size}; { /* check if theme changed */ $selected_theme_index > -1 && colorVariable && 'filter: ' + getColorFromCSSToFilter(colorVariable) + ';'}" src={img} draggable={false} {alt} />
 </div>
{/snippet}

{#if img}
 {#if onClick || isButton}
  <BaseButton {onClick} data-testid={dataTestId}>
   {@render icon()}
  </BaseButton>
 {:else}
  <div data-testid={dataTestId}>
   {@render icon()}
  </div>
 {/if}
{/if}
