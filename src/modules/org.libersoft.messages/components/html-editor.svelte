<script>
 export let elText;
 let text;
</script>

<style>
 .text {
  width: calc(100% - 10px);
  height: calc(100% - 10px);
 }
</style>

<textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea>
