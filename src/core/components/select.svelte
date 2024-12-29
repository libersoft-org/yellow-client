<script>
 export let value = '';
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

<select bind:value>
 <slot></slot>
</select>
