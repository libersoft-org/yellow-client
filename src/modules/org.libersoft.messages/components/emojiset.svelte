<script>
 import { getContext, onMount } from 'svelte';
 import Emoji from './emoji.svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 import { identifier } from '../messages.js';
 import { emoji_render } from '../emojis.js';
 const MessageBar = getContext('MessageBar');
 let emojis = $state([]);

 onMount(async () => {
  try {
   const res = await fetch('modules/' + identifier + '/json/emoji_16_0_ordering.min.json');
   if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
   emojis = await res.json();
  } catch (error) {
   console.error('Error fetching data:', error);
  }
 });

 function clickEmoji(codepoints) {
  /*
  MessageBar.sendMessage('<Emoji codepoints="' + encodeCodepoints(codepoints) + '" />');
*/
  MessageBar.append(emoji_render(codepoints));
 }
</script>

<style>
 .emojiset {
  height: calc(100% - 105px);
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

 .emoji {
  display: flex;
  padding: 3px;
  border-radius: 5px;
 }

 .emoji.hover:hover {
  background: #eee;
 }
</style>

<div class="emojiset">
 {#each emojis as g, index}
  <div class="group">
   <div class="title">{g.group}</div>
   <div class="emojis">
    {#each g.emoji as e, id}
     <BaseButton onClick={() => clickEmoji(e.base)}>
      <div class="emoji hover">
      <Emoji codepoints={e.base} hover={true} is_single={true} />
      </div>
     </BaseButton>
    {/each}
   </div>
  </div>
 {/each}
</div>
