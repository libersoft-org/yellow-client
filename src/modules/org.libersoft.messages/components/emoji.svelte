<script>
 import { debug } from '../../../core/core.js';
 import { rgi, emoji_render, render_emojis_as_static } from '../emojis.js';
 export let codepoints;
 export let size = 40;
 export let is_single = false;

 let url;
 $: url = 'https://fonts.gstatic.com/s/e/notoemoji/latest/' + rgi(codepoints) + ($render_emojis_as_static ? '/emoji.svg' : '/512.webp');
</script>

<style>
 img {
  object-fit: contain;
 }
</style>

{#if $debug}{JSON.stringify(codepoints)}{/if}
<img style="{!is_single && 'padding: 0 2px;'} min-width: {size}px; min-height: {size}px; max-width: {size}px; max-height: {size}px;" src={url} loading="lazy" alt={emoji_render(codepoints)} />
