<script>
 import MessageContentNew from './message-content-new.svelte';
 import { onMount } from 'svelte';
 export let messageContent;

 onMount(() => {
  console.log('messageContent:', messageContent);
 });
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
</style>

<div class="text">
 <MessageContentNew rootNode={messageContent.body} />
</div>
