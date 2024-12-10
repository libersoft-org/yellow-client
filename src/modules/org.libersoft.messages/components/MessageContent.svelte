<script>
 import { mount, onMount } from 'svelte';
 import { componentMap } from './expressions';
 import MessageContentHelper from './MessageContentHelper.svelte';

 export let node; // Accept a DOM node (DocumentFragment, Element, or Text)
 let container; // Reference for appending dynamically created elements

 // Helper to convert attributes to an object
 const getAttributes = attributes => Object.fromEntries(Array.from(attributes).map(attr => [attr.name, attr.value]));

 onMount(() => {
  if (node && node.nodeType === Node.ELEMENT_NODE && !componentMap[node.tagName.toLowerCase()]) {
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
     props: { node: child },
    });
   });
  }
 });

 //$: console.log('MessageContent node:', node);
</script>

{#if node}
 <!-- Handle DocumentFragment -->
 {#if node.nodeType === Node.DOCUMENT_FRAGMENT_NODE}
  {#each Array.from(node.childNodes) as child}
   <svelte:self node={child} />
  {/each}

  <!-- Handle Custom Components -->
 {:else if node.nodeType === Node.ELEMENT_NODE && componentMap[node.tagName.toLowerCase()]}
  <svelte:component this={componentMap[node.tagName.toLowerCase()]} {node} />

  <!-- Handle Standard HTML Elements -->
 {:else if node.nodeType === Node.ELEMENT_NODE}
  <div bind:this={container}></div>

  <!-- Handle Text Nodes -->
 {:else if node.nodeType === Node.TEXT_NODE}
  {node.textContent}
 {/if}
{/if}
