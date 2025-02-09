<script>
 export let value = '';
 let elSelect;

 export function focus() {
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
</style>

<select bind:this={elSelect} bind:value>
 <slot></slot>
</select>
