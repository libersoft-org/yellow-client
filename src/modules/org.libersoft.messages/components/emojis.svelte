<script>
 import { debug, active_account } from '../../../core/core.js';
 import { getContext, onMount } from 'svelte';
 import { get } from 'svelte/store';
 import Emoji from './emoji.svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 import { emojisLoading, emojiGroups, emojisByCodepointsRgi } from '../messages.js';
 import { start_emojisets_fetch, emoji_render } from '../emojis.js';
 import ContextMenu from '../../../core/components/context-menu.svelte';

 const MessageBar = getContext('MessageBar');

 let alts = [];
 let altsMenu;
 let elContainer;

 export function onShow() {
  console.log('emojis onShow');
  elContainer?.focus();
  if ($emojiGroups.length === 0) {
   start_emojisets_fetch(get(active_account), emojisLoading, emojiGroups, emojisByCodepointsRgi);
  }
 }

 function clickEmoji(codepoints) {
  MessageBar.insertText(emoji_render(codepoints));
 }

 function showAlts(e, emoji) {
  console.log('showAlts:', emoji);
  e.preventDefault();
  alts = emoji.alternates;
  if (alts.length === 0) {
   altsMenu.close();
   return;
  }
  altsMenu.openMenu(e);
 }
</script>

<style>
 .emojiset {
  height: calc(100% - 45px);
  overflow: auto;
 }

 .title {
  font-size: 16px;
  text-align: center;
  font-weight: bold;
  padding: 8px;
  background-color: #eee;
  border-radius: 10px;
  margin: 10px;
  border: 1px solid #aaa;
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
  border-radius: 10px;
  transition:
   transform 0.3s ease,
   box-shadow 0.3s ease;
  border: 1px solid #fff;
 }

 .emoji.hover:hover {
  z-index: 90;
  transform: scale(1.5);
  background-color: #f0f0f0;
  border: 1px solid #ddd;
 }
</style>

{#if $debug}
 <pre>
  $emojisLoading: {$emojisLoading}
  $emojiGroups.length: {$emojiGroups.length}
 </pre>
{/if}

<div class="emojiset" bind:this={elContainer} tabindex="-1">
 {#if $emojiGroups.length === 0}
  {#if $emojisLoading}
   <div>Loading...</div>
  {/if}
 {:else}
  {#each $emojiGroups as g, index}
   <div class="group">
    <div class="title">{g.group}</div>
    <div class="emojis">
     {#each g.emoji as emoji, id}
      <BaseButton onClick={() => clickEmoji(emoji.base)} onRightClick={e => showAlts(e, emoji)}>
       <div class="emoji hover">
        <Emoji codepoints={emoji.base} context={'menu'} is_single={true} />
       </div>
      </BaseButton>
     {/each}
    </div>
   </div>
  {/each}
 {/if}
</div>

<ContextMenu bind:this={altsMenu} scrollable={false}>
 <div class="emojis">
  {#each alts as e (e)}
   <BaseButton
    onClick={() => {
     clickEmoji(e);
     altsMenu.close();
    }}
   >
    <div class="emoji hover">
     <Emoji codepoints={e} context={'menu'} is_single={true} />
    </div>
   </BaseButton>
  {/each}
 </div>
</ContextMenu>
