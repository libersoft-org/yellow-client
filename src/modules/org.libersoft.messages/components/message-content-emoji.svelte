<script>
 import Emoji from './emoji.svelte';

 let { node } = $props();
 let codepoints_str = $state(node.attributes.codepoints?.value);
 let codepoints = $state(null);

 $effect(() => {
  updateCodepoints(codepoints_str);
 });

 function updateCodepoints(codepoints_str) {
  if (!codepoints_str) {
   console.log('codepoints is empty:', node);
   return;
  }
  try {
   codepoints = decodeCodepoints(codepoints_str);
  } catch (e) {
   console.log('Error parsing codepoints:', e);
  }
 }

 function decodeCodepoints(str) {
  return str.split(',').map(cp => parseInt(cp, 16));
 }
</script>

<style>
 gif {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
 }
</style>

{#if codepoints}
 <Emoji {codepoints} />
{:else}
 error: {JSON.stringify(node.attributes)}
{/if}
