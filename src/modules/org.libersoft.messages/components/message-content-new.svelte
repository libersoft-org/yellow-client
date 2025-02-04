<script>
 import { componentMap } from '../message-content.ts';

 export let rootNode;

 // Recursive function to render nodes
 function renderNode(node, parentNode = null, level = 0) {
  // Handle text nodes
  if (node.nodeType === Node.TEXT_NODE) {
   return {
    text: node.textContent,
    level,
   };
  }

  // Handle element nodes
  if (node.nodeType === Node.ELEMENT_NODE) {
   // Check if it's a custom component
   const componentName = node.tagName.toLowerCase();

   if (componentMap[componentName]) {
    // Dynamically import and render custom component
    return {
     component: componentMap[componentName],
     props: {
      ...getNodeProps(node),
      node,
      num_siblings: parentNode && parentNode.childNodes ? parentNode.childNodes.length : 0,
      level,
     },
     children: Array.from(node.childNodes)
      .map(n => renderNode(n, node, level + 1))
      .filter(child => child !== null),
    };
   }

   // Regular HTML elements
   return {
    tag: node.tagName.toLowerCase(),
    attrs: getNodeProps(node),
    props: {
     node,
    },
    children: Array.from(node.childNodes)
     .map(n => renderNode(n, node, level + 1))
     .filter(child => child !== null),
   };
  }

  // Unsupported node type
  console.warn('Unsupported node type:', node);
  return null;
 }

 // Extract attributes from a node
 function getNodeProps(node) {
  const props = {};
  for (let attr of node.attributes || []) {
   props[attr.name] = attr.value;
  }
  return props;
 }

 // Main rendering function
 function processFragment(fragment) {
  try {
   if (fragment.childNodes) {
    return Array.from(fragment.childNodes).map(n => renderNode(n, fragment));
   } else {
    return [fragment];
   }
  } catch (e) {
   console.error('Error processing fragment:', e);
   return [];
  }
 }

 // Reactive rendering of the processed fragment
 $: renderedContent = processFragment(rootNode);
</script>

{#each renderedContent as item (item)}
 <!-- Render text nodes -->
 {#if item.text}
  {item.text}

  <!-- Render dynamic (HTML super-set) components -->
 {:else if item.component}
  <svelte:component this={item.component} {...item.props}>
   {#each item.children as child}
    <svelte:component this={child.component} {...child.props} />
   {/each}
  </svelte:component>

  <!-- Render regular HTML elements -->
 {:else if item.tag}
  <svelte:element this={item.tag} {...item.attrs}>
   {#each item.children as child}
    <svelte:self rootNode={child} />
   {/each}
  </svelte:element>
 {/if}
{/each}
