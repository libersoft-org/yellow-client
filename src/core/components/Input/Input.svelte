<script>
 export let type = 'text';
 export let placeholder = '';
 export let value = '';
 export let grow = false;
 export let minWidth;
 export let maxWidth;
 export let onKeydown;
 let elInput;

 function handleKeydown(e) {
  if (onKeydown) onKeydown(e);
 }

 export function focus() {
  elInput?.focus();
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

<input style:flex-grow={grow && '1'} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 22px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 22px)'} {type} {placeholder} bind:this={elInput} bind:value on:keydown={e => handleKeydown(e)} />
