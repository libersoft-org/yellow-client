<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();

	function portal(node: HTMLElement): { update: () => void; destroy: () => void } {
		let target: HTMLElement | null = document.body;

		function update(): void {
			target?.appendChild(node);
			node.hidden = false;
		}

		function destroy(): void {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}

		update();

		return { update, destroy };
	}
</script>

<div hidden use:portal>
	{@render children?.()}
</div>
