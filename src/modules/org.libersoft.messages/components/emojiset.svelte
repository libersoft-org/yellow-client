<script>
 import { onMount } from 'svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 let emojis;

 onMount(async () => {
  try {
   const res = await fetch('https://cdn.jsdelivr.net/gh/googlefonts/emoji-metadata@main/emoji_16_0_ordering.json');
   if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
   emojis = await res.json();
  } catch (error) {
   console.error('Error fetching data:', error);
  }
 });

 function rgi(codepoints) {
  return codepoints.map(codepoint => codepoint.toString(16).padStart(4, '0')).join('_');
 }

 function render(codepoints) {
  return codepoints.map(codepoint => String.fromCodePoint(codepoint)).join('');
 }

 function clickEmoji() {
  console.log('Clicked on emoji');
 }
</script>

<style>
 .title {
  font-size: 14px;
  font-weight: bold;
  padding: 10px;
 }

 .emojis {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 10px;
  overflow: auto; /* TODO - not working */
 }

 .emoji {
  display: flex;
  padding: 3px;
  border-radius: 5px;
 }

 .emoji img {
  width: 40px;
  height: 40px;
 }

 .emoji:hover {
  background: #eee;
 }
</style>

{#each emojis as g, index}
 <div class="group">
  <div class="title">{g.group}</div>
  <div class="emojis">
   {#each g.emoji as e, id}
    <BaseButton onClick={clickEmoji}>
     <div class="emoji">
      <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/{rgi(e.base)}/emoji.svg" loading="lazy" alt={render(e.base)} />
     </div>
    </BaseButton>
   {/each}
  </div>
 </div>
{/each}
