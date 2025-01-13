<script>
 import { debug } from '../../../core/core.js';
 import { rgi, emoji_render } from '../emojis.js';
 export let codepoints;
 export let size = 40;
 export let is_single = false;

</script>


<style>

 img {
  object-fit: contain;
 }

</style>

{#if $debug}{JSON.stringify(codepoints)}{/if}
<img style="{!is_single && 'padding: 10px 0'} width: {size}px; height: {size}px;" src="https://fonts.gstatic.com/s/e/notoemoji/latest/{rgi(codepoints)}/emoji.svg" loading="lazy" alt={emoji_render(codepoints)} />
