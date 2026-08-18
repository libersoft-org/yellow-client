<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();

	interface IPortalAction {
		update: () => void;
		destroy: () => void;
	}

	function portal(node: HTMLElement): IPortalAction {
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
