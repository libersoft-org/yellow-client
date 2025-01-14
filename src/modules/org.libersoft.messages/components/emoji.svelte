<script>
 import { debug } from '../../../core/core.js';
 import { rgi, emoji_render, render_emojis_as_static } from '../emojis.js';
 import { emojisByCodepointsRgi } from '../messages.js';

 export let codepoints;
 let codepoints_rgi = rgi(codepoints);

 export let size = 40;
 export let is_single = false;

 let animate = !$render_emojis_as_static && $emojisByCodepointsRgi?.[codepoints_rgi]?.animated;

 let url;
 $: url = 'https://fonts.gstatic.com/s/e/notoemoji/latest/' + codepoints_rgi + (!animate ? '/emoji.svg' : '/512.webp');
</script>

<style>
 img {
  object-fit: contain;
 }
</style>

{#if $debug}
 <code>
 codepoints:{JSON.stringify(codepoints)}
 codepoints_rgi:{codepoints_rgi}
 is_single:{is_single}
 size:{size}
 animate:{animate}
 url:{url}
  </code>
{/if}
<img style="{!is_single && 'padding: 0 2px;'} min-width: {size}px; min-height: {size}px; max-width: {size}px; max-height: {size}px;" loading="lazy" alt={emoji_render(codepoints)} src={url}/>
