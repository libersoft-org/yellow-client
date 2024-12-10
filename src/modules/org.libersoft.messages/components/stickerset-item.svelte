<script>
 import Sticker from './sticker.svelte';
 export let file;
 export let onClick;

 function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   onClick(file);
  }
 }
</script>

<style>
 .link {
  cursor: pointer;
 }
</style>

{#if file}
 <div class="link" role="button" tabindex="0" on:click={onClick(file)} on:keydown={handleKeydown(file)}>
  <Sticker {file} size="80" />
 </div>
{/if}
