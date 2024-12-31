<script>
 import { getContext, onMount } from 'svelte';
 import Emoji from './emoji.svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 import { htmlEscape } from '../messages.js';

 const MessageBar = getContext('MessageBar');
 const menu = getContext('ContextMenu');

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

 function encodeCodepoints(codepoints) {
  return codepoints.map(cp => cp.toString(16).padStart(4, '0')).join(',');
 }

 function clickEmoji(codepoints) {
  console.log('Clicked on emoji');
  MessageBar.sendMessage('<Emoji codepoints="' + encodeCodepoints(codepoints) + '" />');
  menu?.close();
 }
</script>

<style>
 .emojiset {
  height: calc(100% - 45px);
  overflow: auto;
 }

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
</style>

<div class="emojiset">
 {#each emojis as g, index}
  <div class="group">
   <div class="title">{g.group}</div>
   <div class="emojis">
    {#each g.emoji as e, id}
     <BaseButton onClick={() => clickEmoji(e.base)}>
      <Emoji codepoints={e.base} />
     </BaseButton>
    {/each}
   </div>
  </div>
 {/each}
</div>
