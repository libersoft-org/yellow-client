<script>
 import { tick } from 'svelte';
 export let text;
 let elText;

 $: update1(elText);

 async function update1(elText) {
  if (!elText) return;
  await tick();
  elText.focus();
 }
</script>

<style>
 .text {
  width: calc(100% - 22px);
  height: calc(100% - 22px);
  padding: 10px;
  border: 1px solid #080;
  font-family: 'Ubuntu Mono', serif;
  font-size: inherit;
 }
</style>

<textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea>
