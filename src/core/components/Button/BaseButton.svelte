<script lang="ts">
 import type { HTMLButtonAttributes, MouseEventHandler } from 'svelte/elements';

 interface BaseButtonProps extends HTMLButtonAttributes {
  children?: any;
  onClick?: MouseEventHandler<HTMLButtonElement>; // todo: this prop is for backward compatibility
  onRightClick?: MouseEventHandler<HTMLButtonElement>; // todo: this prop is for backward compatibility
  onMousedown?: MouseEventHandler<HTMLButtonElement>; // todo: this prop is for backward compatibility
 }

 let { children, onClick, onRightClick, onMousedown, ...restProps }: BaseButtonProps = $props();
</script>

<style>
 .base-button {
  cursor: pointer;
  display: flex;
 }
</style>

<button class="base-button button-reset" tabindex="0" {...restProps} onclick={onClick} onmousedown={onMousedown} oncontextmenu={onRightClick}>
 {@render children?.()}
</button>
