<script>
 // let { item } = $props(); // TODO: Svelte 5
</script>

<style>
 table {
  border-spacing: 0;
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
 }
</style>

<table>
 <!--
 TODO: Svelte 5:
 {@render item()}
-->
 <slot />
</table>
