<script>
 export let value = '';
 let elSelect;

 export function focus() {
  console.log('select.svelte focus(), elSelect=', elSelect);
  elSelect?.focus();
 }
</script>

<style>
 select {
  padding: 10px;
  font-family: inherit;
  font-size: inherit;
  border: 1px solid #888;
  border-radius: 10px;
  background-color: #fff;
 }

 select:focus {
  outline: 2px solid teal;
 }
</style>

<select bind:this={elSelect} bind:value>
 <slot></slot>
</select>
