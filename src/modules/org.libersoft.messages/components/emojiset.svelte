<script>
 import { getContext, onMount } from 'svelte';
 import Emoji from './emoji.svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 import { emojiGroups } from '../messages.js';
 import { emoji_render } from '../emojis.js';
 const MessageBar = getContext('MessageBar');

 function clickEmoji(codepoints) {
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
 {#each $emojiGroups as g, index}
  <div class="group">
   <div class="title">{g.group}</div>
   <div class="emojis">
    {#each g.emoji as e, id}
     <BaseButton onClick={() => clickEmoji(e.base)}>
      <div class="emoji hover">
       <Emoji codepoints={e.base} context={"menu"} is_single={true} />
      </div>
     </BaseButton>
    {/each}
   </div>
  </div>
 {/each}
</div>
