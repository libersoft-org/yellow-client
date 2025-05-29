<script>
  export let expand = false;
</script>

<table class={expand && 'expand'}>
  <slot />
</table>

<style>
  table {
    border-spacing: 0;
    border: 1px solid #000;
    border-radius: 10px;
    overflow: hidden;
  }

  table.expand {
    width: 100%;
  }
</style>
