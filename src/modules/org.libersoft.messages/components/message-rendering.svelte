<script>
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
  //console.log('update, messageContent:', messageContent, 'gen:', gen);
 }
</script>

<style>
 .text {
  padding-bottom: 10px;
  word-break: break-word;
 }
</style>

{#if messageContent.type === 'html'}
 <div class="text" bind:this={messageContentContainer}><MessageContent container={messageContentContainer} node={messageContent.body} /></div>
{:else}
 <div class="text">{@html messageContent.body}</div>
{/if}
