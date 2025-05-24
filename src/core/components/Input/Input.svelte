<script lang="ts">
 interface Props {
  type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string | number;
  grow?: boolean;
  minWidth?: string;
  maxWidth?: string;
  onKeydown?: (e: KeyboardEvent) => void;
  min?: number;
  max?: number;
  label?: any;
  inputRef?: HTMLInputElement;
 }

 let { type = 'text', placeholder = '', value = $bindable(), inputRef: parentInputRef = $bindable(), grow = false, minWidth = undefined, maxWidth = undefined, onKeydown = undefined, min = undefined, max = undefined, label = undefined }: Props = $props();

 let inputRef = $state<HTMLInputElement>();

 // Bind the inputRef ref manually to the parent component from internal state
 $effect(() => {
  if (inputRef) {
   parentInputRef = inputRef;
  }
 });

 function handleKeydown(e) {
  if (onKeydown) onKeydown(e);
 }

 export function focus() {
  inputRef?.focus();
 }
</script>

<style>
 input {
  box-sizing: content-box;
  padding: 10px;
  border: 1px solid #999;
  border-radius: 10px;
  font-family: inherit;
  font-size: inherit;
 }

 input:focus {
  outline: 2px solid #0060df;
 }

 .input {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
  min-width: 0;
  flex: 1 1 auto;
 }

 label {
  font-size: 15px;
  padding-left: 5px;
  font-weight: bold;
 }
</style>

{#snippet input()}
 <input id={label} bind:value style:flex-grow={grow ? '1' : undefined} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 22px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 22px)'} {type} {placeholder} {min} {max} bind:this={inputRef} onkeydown={e => handleKeydown(e)} />
{/snippet}

<div class="input">
 {#if label}
  <label for={label}>
   {label}
  </label>
  {@render input()}
 {:else}
  {@render input()}
 {/if}
</div>
