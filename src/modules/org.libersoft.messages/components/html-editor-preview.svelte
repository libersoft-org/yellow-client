<script>
 import MessageRendering from './message-rendering.svelte';
 import { processMessage } from '../messages.js';
 export let text;

 $: messageContent = processMessage({ format: 'html', message: text });
</script>

<style>
 .preview {
  padding: 10px;
 }
</style>

<div class="preview">
 <MessageRendering {messageContent} />
</div>
