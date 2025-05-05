<script lang="ts">
 import BaseButton from './BaseButton.svelte';
 import Icon from '../Icon/Icon.svelte';
 import type { HTMLButtonAttributes } from 'svelte/elements';
 import Spinner from '@/core/components/Spinner/Spinner.svelte';

 interface ButtonProps extends HTMLButtonAttributes {
  children?: any;
  img?: string;
  text?: string;
  enabled?: boolean;
  hiddenOnDesktop?: boolean;
  width?: string;
  onClick?: (e: Event) => void;
  padding?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  expand?: boolean;
  colorVariable?: string;
  iconSize?: number;
  iconPadding?: number;
  loading?: boolean;
 }

 let { children, img = '', text = '', enabled = true, hiddenOnDesktop = false, width, onClick, padding = '10px', bgColor = '#fd1', borderColor = '#b90', textColor = '#000', expand = false, colorVariable, iconSize = 20, iconPadding = 0, loading = false, ...restProps }: ButtonProps = $props();

 function handleClick(e) {
  if (enabled && onClick) {
   onClick(e);
  }
 }
</script>

<style>
 .button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-align: center;
  border-radius: 10px;
  font-weight: bold;
  border: 1px solid;
 }

 .button.disabled {
  background-color: #bbb !important;
  border-color: #bbb !important;
  cursor: default;
 }

 @media (min-width: 769px) {
  .hidden-on-desktop {
   display: none;
  }
 }
</style>

<BaseButton onClick={handleClick} {...restProps} disabled={!enabled}>
 <div class="button {!enabled ? 'disabled' : ''} {hiddenOnDesktop ? 'hidden-on-desktop' : ''}" style={(width ? 'width: ' + width + ';' : '') + 'padding: ' + padding + ';'} style:background-color={bgColor} style:color={textColor} style:border-color={borderColor} style:flex-grow={expand ? '1' : undefined}>
  {#if children}
   {@render children?.()}
  {/if}
  {#if loading}
   <Spinner size="0px" containerMinHeight="auto" />
  {:else}
   {#if img}
    <Icon {img} alt={text} size={iconSize} padding={iconPadding} colorVariable={colorVariable && colorVariable} />
   {/if}
   {#if text}
    <div>{text}</div>
   {/if}
  {/if}
 </div>
</BaseButton>
