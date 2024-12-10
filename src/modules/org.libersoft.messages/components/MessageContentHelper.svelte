<script>
 import MessageContent from './MessageContent.svelte';
 export let node; // Accept a DOM node (DocumentFragment, Element, or Text)
 export let container; // Reference for appending dynamically created elements
</script>

<MessageContent {node} {container} />
