<script>
 import MessageContent from './message-content.svelte';
 export let node; // Accept a DOM node (DocumentFragment, Element, or Text)
 export let level;
 export let container; // Reference for appending dynamically created elements
 export let num_siblings;
</script>

<MessageContent {node} {container} {num_siblings} {level} />
