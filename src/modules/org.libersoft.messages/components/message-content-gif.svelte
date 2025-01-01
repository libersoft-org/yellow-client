<script>
 let { node } = $props();
 let v = node.attributes.file?.value;
</script>

<style>
 .gif {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
 }
</style>

{#if v}
 <div class="gif">
  <img src={v} alt="GIF" />
 </div>
{:else}
 error
{/if}
