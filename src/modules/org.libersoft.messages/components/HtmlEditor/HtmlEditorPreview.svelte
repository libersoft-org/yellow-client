<script>
  import MessageContent from '../MessageContent/MessageContent.svelte';
  import { processMessage } from '../../messages.ts';
  export let text;

  $: messageContent = processMessage({ format: 'html', message: text });
</script>

<div class="preview">
  <MessageContent {messageContent} />
</div>

<style>
  .preview {
    padding: 10px;
  }
</style>
