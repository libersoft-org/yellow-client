<script>
 import { mount, onMount } from 'svelte';
 import { componentMap } from './expressions';
 import MessageContentHelper from './MessageContentHelper.svelte';

 export let node; // Accept a DOM node (DocumentFragment, Element, or Text)
 export let container; // Reference for appending dynamically created elements

 let loaded;

 // Helper to convert attributes to an object
 const getAttributes = attributes => Object.fromEntries(Array.from(attributes).map(attr => [attr.name, attr.value]));

 onMount(() => {
  load(container);
 });

 function load(container) {
  if (!container || loaded) {
   return;
  }
  loaded = true;

  create_node(node, container);
 }

 function create_node(node, container) {
  if (!node) {
   return;
  }

  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
   Array.from(node.childNodes).forEach(child => {
    mount(MessageContentHelper, {
     target: container,
     props: { node: child, container },
    });
   });
  } else if (node.nodeType === Node.ELEMENT_NODE && !componentMap[node.tagName.toLowerCase()]) {
   // Dynamically create the HTML element
   const element = document.createElement(node.tagName.toLowerCase());
   const attributes = getAttributes(node.attributes);

   // Set attributes on the created element
   Object.keys(attributes).forEach(attr => {
    element.setAttribute(attr, attributes[attr]);
   });

   container.appendChild(element);

   // Recursively render children
   console.log('MessageContent node:', node);
   console.log('MessageContent node.childNodes:', node.childNodes);
   Array.from(node.childNodes).forEach(child => {
    console.log('MessageContent child:', child);

    mount(MessageContentHelper, {
     target: element,
     props: { node: child, container: element },
    });
   });
  }
 }

 $: load(container);

 //$: console.log('MessageContent node:', node);
</script>

{#if node}
 <!-- Handle Custom Components -->
 {#if node.nodeType === Node.ELEMENT_NODE && componentMap[node.tagName.toLowerCase()]}
  <svelte:component this={componentMap[node.tagName.toLowerCase()]} {node} />

  <!-- Handle Text Nodes -->
 {:else if node.nodeType === Node.TEXT_NODE}
  {node.textContent}
 {/if}
{/if}
