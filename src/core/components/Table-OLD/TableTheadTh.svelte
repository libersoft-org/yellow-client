<script>
 export let center = false;
</script>

<style>
 th {
  padding: 10px;
  background-color: #222;
  color: #fff;
  text-align: left;
 }

 th.center {
  text-align: center;
 }
</style>

<th class:center>
 <slot />
</th>
