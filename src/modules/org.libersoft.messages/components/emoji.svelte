<script>
 import { debug } from '../../../core/core.js';

 export let codepoints;

 function rgi(codepoints) {
  return codepoints.map(codepoint => codepoint.toString(16).padStart(4, '0')).join('_');
 }

 function render(codepoints) {
  return codepoints.map(codepoint => String.fromCodePoint(codepoint)).join('');
 }
</script>

<style>
 .emoji {
  display: flex;
  padding: 3px;
  border-radius: 5px;
 }

 .emoji img {
  width: 40px;
  height: 40px;
  object-fit: contain;
 }

 .emoji:hover {
  background: #eee;
 }
</style>

{#if $debug}{JSON.stringify(codepoints)}{/if}
<div class="emoji">
 <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/{rgi(codepoints)}/emoji.svg" loading="lazy" alt={render(codepoints)} />
</div>
