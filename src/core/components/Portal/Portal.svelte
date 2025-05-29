<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	function portal(node: HTMLElement) {
		let target: HTMLElement | null = document.body;

		function update() {
			target?.appendChild(node);
			node.hidden = false;
		}

		function destroy() {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}

		update();

		return { update, destroy };
	}
</script>

<div hidden use:portal>
	{@render children()}
</div>
