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
  step?: number;
  'data-testid'?: string;
 }

 let { type = 'text', placeholder = '', value = $bindable(), grow = false, minWidth = undefined, maxWidth = undefined, onKeydown = undefined, min = undefined, max = undefined, step = undefined, 'data-testid': testId = undefined }: Props = $props();

 let inputRef: HTMLInputElement;

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
</style>

<input data-testid={testId} bind:value style:flex-grow={grow ? '1' : undefined} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 22px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 22px)'} {type} {placeholder} {min} {max} {step} bind:this={inputRef} onkeydown={e => handleKeydown(e)} />
