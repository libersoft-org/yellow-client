<script>
 import { debug } from '../../../core/core.js';
 import { emoji_render } from '../messages.js';
 export let codepoints;
 export let size = 40;
 export let hover = false;

 function rgi(codepoints) {
  return codepoints.map(codepoint => codepoint.toString(16).padStart(4, '0')).join('_');
 }
</script>

<style>
 .emoji {
  display: flex;
  padding: 3px;
  border-radius: 5px;
 }

 .emoji img {
  object-fit: contain;
 }

 .emoji.hover:hover {
  background: #eee;
 }
</style>

{#if $debug}{JSON.stringify(codepoints)}{/if}
<div class="emoji {hover ? 'hover' : ''}">
 <img style="width: {size}px; height: {size}px;" src="https://fonts.gstatic.com/s/e/notoemoji/latest/{rgi(codepoints)}/emoji.svg" loading="lazy" alt={emoji_render(codepoints)} />
</div>
