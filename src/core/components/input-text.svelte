<script>
 export let password = false;
 export let placeholder = '';
 export let value = '';
 export let onKeydown;
 export let grow = false;
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
  padding: 10px;
  border: 1px solid #999;
  border-radius: 10px;
  font-family: inherit;
  font-size: inherit;
 }

 .grow {
  flex-grow: 1;
 }
</style>

<input class={grow && 'grow'} type={password ? 'password' : 'text'} {placeholder} bind:this={elInput} bind:value on:keydown={e => handleKeydown(e)} />
