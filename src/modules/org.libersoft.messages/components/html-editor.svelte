<script>
 export let elText;
 export let text;
</script>

<style>
 .text {
  width: calc(100% - 22px);
  height: calc(100% - 22px);
  padding: 10px;
  border: 1px solid #080;
  /*font-family: inherit; // TODO: switch to Ubuntu Mono (not regular Ubuntu) as it is a HTML code*/
  font-size: inherit;
 }
</style>

<textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea>
