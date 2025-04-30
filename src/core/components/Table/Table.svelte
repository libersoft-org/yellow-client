<script>
 export let expand = false;
</script>

<style>
 .table {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
 }

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

<div class="table">
 <table class={expand && 'expand'}>
  <slot />
 </table>
</div>
