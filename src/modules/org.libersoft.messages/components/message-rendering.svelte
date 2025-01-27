<script>
 import MessageContent from './message-content.svelte';
 import MessageContentNew from './message-content-new.svelte';
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
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  word-break: break-word;
 }
</style>

{#if messageContent.type === 'html'}
 <div class="text" bind:this={messageContentContainer}>
  <!--<MessageContent level={0} container={messageContentContainer} node={messageContent.body} />-->
  <MessageContentNew rootNode={messageContent.body} />
 </div>
{:else}
 UNUSED
 <div class="text">{@html messageContent.body}</div>
{/if}
