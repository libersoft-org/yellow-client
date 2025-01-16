<script>
 import { debug } from '../../../core/core.js';
 import { rgi, emoji_render, render_emojis_as_static, render_emojis_as_raster } from '../emojis.js';
 import { emojisByCodepointsRgi } from '../messages.js';
 import Sticker from './sticker.svelte';

 export let codepoints;
 let codepoints_rgi = rgi(codepoints);

 export let size = 40;
 export let is_single = false;
 export let context;

 let is_mouse_over;

 let is_animated;
 $: is_animated = $emojisByCodepointsRgi?.[codepoints_rgi]?.animated;

 let url;
 $: update_url(context, is_mouse_over, codepoints_rgi, $render_emojis_as_static, $render_emojis_as_raster);

 function update_url(context, is_mouse_over, codepoints_rgi, render_emojis_as_static, raster) {
  url = 'https://fonts.gstatic.com/s/e/notoemoji/latest/' + codepoints_rgi + '/';

  if (context === 'message') {
   let animate = !render_emojis_as_static && is_animated;
   if (animate) {
    if (raster) {
     url += '512.webp';
    } else {
     url += 'lottie.json';
    }
   } else {
    if (raster) {
     url += '512.png';
    } else {
     url += 'emoji.svg';
    }
   }
  } else if (context === 'menu') {
   let animate = is_animated;
   if (animate) url += 'lottie.json';
   else url += 'emoji.svg';
  }
 }
</script>

<style>
 img {
  object-fit: contain;
 }
</style>

{#if $debug}
 <pre>
 codepoints:{JSON.stringify(codepoints)}
 codepoints_rgi:{codepoints_rgi}
 is_single:{is_single}
 size:{size}
 render_emojis_as_static:{$render_emojis_as_static}
 is_animated:{is_animated}
 animate:{animate}
 url:{url}
 </pre>
{/if}

{#if url.endsWith('/lottie.json')}
 <Sticker file={url} {size} />
{:else}
 <img style="{!is_single && 'padding: 0 2px;'} min-width: {size}px; min-height: {size}px; max-width: {size}px; max-height: {size}px;" loading="lazy" alt={emoji_render(codepoints)} src={url} onMouseOver={() => (is_mouse_over = true)} onMouseOut={() => (is_mouse_over = false)} />
{/if}
