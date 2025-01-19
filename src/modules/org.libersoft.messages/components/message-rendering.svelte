<script>
 import { debug } from '../../../core/core.js';
 import MessageContent from './message-content.svelte';
 export let messageContent;
 let messageContentContainer;
 // ensure messageContentContainer is thrown away and re-created when messageContent changes, because MessageContent modifies it imperatively
 let gen = 0;
 let dummyArray = [];

 $: update(messageContent);

 function update(messageContent) {
  dummyArray = [messageContent];
  gen++;
  console.log('update, messageContent:', messageContent, 'gen:', gen);
 }
</script>

<style>
 .text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding-bottom: 10px;
  word-break: break-word;
  overflow-wrap: break-word;
 }

 /*
 .debug {
  word-break: break-word;
 }
 */
</style>

<!--{#if $debug}-->
<!--<div class="debug">-->
<!-- <div>gen: {gen}</div>-->
<!-- {JSON.stringify(messageContent.body, null, 2)}-->
<!--</div>-->
<!--{/if}-->

{#each dummyArray as messageContent}
 {#if messageContent.format === 'html'}
  <div class="text" bind:this={messageContentContainer}>
   <MessageContent level={0} container={messageContentContainer} node={messageContent.body} />
  </div>
 {:else}
  <!-- TODO: Unused, switch plaintext / HTML -->
  <div class="text">{@html messageContent.body}</div>
 {/if}
{/each}
