<script>
 import MessageRendering from './message-rendering.svelte';
 import { processMessage } from '../messages.js';
 export let text;

 $: messageContent = processMessage(text);
</script>

<MessageRendering {messageContent} />
