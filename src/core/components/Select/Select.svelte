<script lang="ts">
 import type { HTMLSelectAttributes } from 'svelte/elements';

 interface Props extends HTMLSelectAttributes {
  value: string;
  grow?: boolean;
  minWidth?: string;
  maxWidth?: string;
  children?: any;
 }

 let { value = $bindable(''), grow = false, minWidth, maxWidth, children, ...restProps }: Props = $props();

 let selectRef: HTMLSelectElement;

 export function focus() {
  selectRef?.focus();
 }
</script>

<style>
 select {
  box-sizing: content-box;
  -webkit-appearance: none;
  appearance: none;
  padding: 10px 20px 10px 10px;
  font-family: inherit;
  font-size: inherit;
  border: 1px solid #888;
  border-radius: 10px;
  background: url('/img/down.svg') no-repeat;
  background-size: 12px 12px;
  background-position: right 5px center;
  background-color: #fff;
 }

 select:focus {
  outline: 2px solid #0060df;
 }
</style>

<select {...restProps} style:flex-grow={grow ? '1' : undefined} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 32px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 32px)'} bind:this={selectRef} bind:value>
 {@render children?.()}
</select>
