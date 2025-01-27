<script>
 import { mount } from 'svelte';
 import { componentMap } from '../expressions.ts';
 import MessageContentHelper from './message-content-helper.svelte';
 export let level;
 export let node; // Accept a DOM node (DocumentFragment, Element, or Text)
 export let container; // Reference for appending dynamically created elements
 export let num_siblings;
 let loaded;
 // Helper to convert attributes to an object
 const getAttributes = attributes => Object.fromEntries(Array.from(attributes).map(attr => [attr.name, attr.value]));

 /* onMount(() => {
  console.log('MessageContent onMount node:', node);
  load(container);
 });*/

 function load(container, node) {
  if (!container || !node) return;
  if (loaded) {
   //clear container
   while (container.firstChild) container.removeChild(container.firstChild);
  }
  loaded = true;
  create_node(node, container);
 }

 function create_node(node, container) {
  /*if (!node) {
   return;
  }*/

  if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
   //console.log('MessageContent create_node DOCUMENT_FRAGMENT_NODE:', container, node);
   Array.from(node.childNodes).forEach(child => {
    mount(MessageContentHelper, {
     target: container,
     props: { node: child, container, num_siblings: node.childNodes.length, level: level + 1 },
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
   /*console.log('MessageContent node:', node);
   console.log('MessageContent node.childNodes:', node.childNodes);*/
   Array.from(node.childNodes).forEach(child => {
    //console.log('MessageContent child:', child);
    mount(MessageContentHelper, {
     target: element,
     props: { node: child, container: element },
    });
   });
  }
 }

 $: load(container, node);
 //$: console.log('MessageContent node:', node);
</script>

{#if node}
 <!-- Handle Custom Components -->
 {#if node.nodeType === Node.ELEMENT_NODE && componentMap[node.tagName.toLowerCase()]}
  <svelte:component this={componentMap[node.tagName.toLowerCase()]} {node} {level} {num_siblings} />
  <!-- Handle Text Nodes -->
 {:else if node.nodeType === Node.TEXT_NODE}
  {node.textContent}
 {/if}
{/if}
