<script>
  export let center = false;
</script>

<th class:center>
  <slot />
</th>

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
