<script>
	import { componentMap } from '../../message-content.ts';
	import { onMount } from 'svelte';
	import { debug } from '@/core/core.ts';

	export let rootNode;

	onMount(() => {
		//console.log('rootNode:', rootNode);
	});

	// Recursive function to render nodes
	function renderNode(node, parentNode = null, level = 0) {
		const positionBetweenSiblings = parentNode && parentNode.childNodes ? Array.from(parentNode.childNodes).indexOf(node) : 0;
		const tagUniqueId = `tag-unique-id-${node.tagName || node.nodeType}-${level}-${positionBetweenSiblings}`;

		// Handle text nodes
		if (node.nodeType === Node.TEXT_NODE) {
			return {
				text: node.textContent,
				level,
				tagUniqueId,
			};
		}

		// Handle element nodes
		if (node.nodeType === Node.ELEMENT_NODE) {
			// Check if it's a custom component
			const componentName = node.tagName.toLowerCase();

			if (componentMap[componentName]) {
				// Dynamically import and render custom component
				return {
					tagUniqueId,
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
				tagUniqueId,
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
				const res = Array.from(fragment.childNodes).map(n => renderNode(n, fragment));
				//console.log('processFragment fragment:', fragment, 'res:', res);
				return res;
			} else {
				//console.log('No child nodes found in fragment:', fragment);
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

{#each renderedContent as item (item.tagUniqueId)}
	<!-- Render text nodes -->
	{#if item.text}
		{item.text}
		<!-- Render dynamic (HTML super-set) components -->
	{:else if item.component}
		{#key item.tagUniqueId}
			<svelte:component this={item.component} {...item.props} children={item.children} />
			<!-- INFO: custom components should take care of rendering its children themselves (see example below) -->
			<!-- EXAMPLE:
    {#each item.children as child (child.tagUniqueId)}
     <svelte:component this={child.component} {...child.props} />
    {/each}
   </svelte:component>
   -->
		{/key}
		<!-- Render regular HTML elements -->
	{:else if item.tag}
		{#key item.tagUniqueId}
			<svelte:element this={item.tag} {...item.attrs}>
				{#each item.children as child (child.tagUniqueId)}
					{#if $debug}xxx{JSON.stringify(child)}xxx{/if}
					<svelte:self rootNode={item.props.node} />
				{/each}
			</svelte:element>
		{/key}
	{/if}
{/each}
