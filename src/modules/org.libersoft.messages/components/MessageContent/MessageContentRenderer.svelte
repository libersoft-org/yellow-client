<script lang="ts">
	import { componentMap } from '@/org.libersoft.messages/scripts/message-content.ts';
	import { debug } from '@/core/scripts/stores.ts';
	import MessageContentRenderer from './MessageContentRenderer.svelte';
	interface Props {
		/** DOM node/fragment to render. Used at the top level. */
		rootNode?: any;
		/** Already-processed child descriptors. Used when this component renders itself recursively. */
		nodes?: any[];
	}
	let { rootNode, nodes }: Props = $props();

	/* Messages arrive from a remote peer, so the tree they describe has to be bounded before it is
	 * turned into components. */
	const MAX_DEPTH = 32;
	const MAX_NODES = 2000;

	// Recursive function to render nodes
	function renderNode(node: any, parentNode: any, level: number, budget: { remaining: number }): any {
		if (budget.remaining <= 0) return null;
		budget.remaining--;
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
			// Beyond the depth limit, keep the text content but stop building components
			if (level >= MAX_DEPTH) {
				return {
					text: node.textContent,
					level,
					tagUniqueId,
				};
			}

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
					children: renderChildren(node, level, budget),
				};
			}

			// Regular HTML elements
			return {
				tagUniqueId,
				tag: componentName,
				attrs: getNodeProps(node),
				props: {
					node,
				},
				children: renderChildren(node, level, budget),
			};
		}

		// Unsupported node type
		console.warn('Unsupported node type:', node.nodeType);
		return null;
	}

	function renderChildren(node: any, level: number, budget: { remaining: number }): any[] {
		return Array.from(node.childNodes)
			.map(n => renderNode(n, node, level + 1, budget))
			.filter(child => child !== null);
	}

	// Extract attributes from a node
	function getNodeProps(node: any): Record<string, string> {
		const props = {};
		for (let attr of node.attributes || []) {
			props[attr.name] = attr.value;
		}
		return props;
	}

	// Main rendering function
	function processFragment(fragment: any): any[] {
		try {
			if (!fragment) return [];
			if (fragment.childNodes) {
				const budget = { remaining: MAX_NODES };
				return Array.from(fragment.childNodes)
					.map(n => renderNode(n, fragment, 0, budget))
					.filter(child => child !== null);
			}
			return [fragment];
		} catch (e) {
			console.error('Error processing fragment:', e);
			return [];
		}
	}

	// Reactive rendering of the processed fragment
	let renderedContent = $derived(nodes ?? processFragment(rootNode));
</script>

{#each renderedContent as item (item.tagUniqueId)}
	<!-- Render text nodes -->
	{#if item.text}
		{item.text}
		<!-- Render dynamic (HTML super-set) components -->
	{:else if item.component}
		{#key item.tagUniqueId}
			{@const Component = item.component}
			<Component {...item.props} children={item.children} />
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
				{#if $debug}xxx{JSON.stringify(item.attrs)}xxx{/if}
				{#if item.children.length}
					<MessageContentRenderer nodes={item.children} />
				{/if}
			</svelte:element>
		{/key}
	{/if}
{/each}
