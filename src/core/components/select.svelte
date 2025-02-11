<script>
 export let value = '';
 export let grow = false;
 export let minWidth;
 export let maxWidth;
 let elSelect;

 export function focus() {
  console.log('select.svelte focus(), elSelect=', elSelect);
  elSelect?.focus();
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
  background: url('img/down-black.svg') no-repeat;
  background-size: 12px 12px;
  background-position: right 5px center;
  background-color: #fff;
 }

 select:focus {
  outline: 2px solid #0060df;
 }
</style>

<select style:flex-grow={grow && '1'} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 32px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 32px)'} bind:this={elSelect} bind:value>
 <slot></slot>
</select>
