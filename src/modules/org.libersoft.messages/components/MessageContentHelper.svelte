<script>
 import MessageContent from './MessageContent.svelte';
 export let node; // Accept a DOM node (DocumentFragment, Element, or Text)
</script>

<MessageContent {node} />
