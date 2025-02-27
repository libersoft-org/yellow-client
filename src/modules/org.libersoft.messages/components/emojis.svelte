<script>
 import { debug, active_account, isMobile } from '../../../core/core.js';
 import { getContext, onMount } from 'svelte';
 import { get } from 'svelte/store';
 import { identifier } from '../messages.js';
 import Emoji from './emoji.svelte';
 import BaseButton from '../../../core/components/base-button.svelte';
 import { emojisLoading, emojiGroups, emojisByCodepointsRgi } from '../messages.js';
 import { start_emojisets_fetch, emoji_render } from '../emojis.js';
 import ContextMenu from '../../../core/components/context-menu.svelte';
 import InputButton from '../../../core/components/input-button.svelte';
 import FuzzySearch from 'fuzzy-search';
 import Spinner from '../../../core/components/spinner.svelte';
 import { longpress } from '../ui.js';

 const MessageBar = getContext('MessageBar');

 let alts = [];
 let altsMenu;
 let elContainer;
 let elSearchInput;
 let search = '';
 let results;

 $: results = find($emojiGroups, search);

 function find(groups, search) {
  console.log('find:', search);
  if (!groups) return [];
  if (!search) return null;
  let all = {};
  for (let group of groups) {
   for (let emoji of group.emoji) {
    all[emoji.codepoints_rgi] = emoji;
   }
  }
  all = Object.values(all);
  let res = new FuzzySearch(all, ['shortcodes', 'emoticons'], { caseSensitive: false, sort: true }).search(search);
  console.log('find:', res);
  return res;
 }

 export function onShow() {
  console.log('emojis onShow');
  if (!get(isMobile)) {
   elSearchInput?.focus?.();
  }
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
 .filter {
  padding: 10px;
 }

 .emojiset {
  height: calc(100% - 105px);
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
  search: {search}
  results.length: {results?.length}
 </pre>
{/if}

<div class="filter">
 <InputButton alt="Search" bind:this={elSearchInput} bind:value={search} img="modules/{identifier}/img/search.svg" placeholder="Search ..." />
</div>

{#snippet clickable_emoji(emoji)}
 <BaseButton onRightClick={e => showAlts(e, emoji)}>
  <div
   class="emoji hover"
   use:longpress
   on:longpress={e => showAlts(e, emoji)}
   on:mymousedown={() => {
    altsMenu?.close();
   }}
   on:click={() => clickEmoji(emoji.base)}
   on:keydown={e => {}}
   role="button"
   tabindex="0"
  >
   <Emoji codepoints={emoji.base} context={'menu'} is_single={true} />
  </div>
 </BaseButton>
{/snippet}

<div class="emojiset" bind:this={elContainer} tabindex="-1">
 {#if $emojisLoading}
  <Spinner />
 {:else if search}
  {#if results.length === 0}
   <div>No emojis found</div>
  {:else}
   <div class="group">
    <div class="emojis">
     {#each results as emoji (emoji.codepoints_rgi)}
      {@render clickable_emoji(emoji)}
     {/each}
    </div>
   </div>
  {/if}
 {:else}
  {#each $emojiGroups as g (g.group)}
   <div class="group">
    <div class="title">{g.group}</div>
    <div class="emojis">
     {#each g.emoji as emoji (emoji.codepoints_rgi)}
      {@render clickable_emoji(emoji)}
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
