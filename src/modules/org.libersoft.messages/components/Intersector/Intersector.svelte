<script lang="ts">
	import { onDestroy } from 'svelte';
	let { items, item_slot } = $props();
	let visibility = $state({});
	let observer = new IntersectionObserver(intersecting, { threshold: 0.01 });

	onDestroy(() => {
		observer.disconnect();
	});

	function observeItem(node: HTMLElement): { destroy(): void } {
		observer.observe(node);
		return {
			destroy() {
				observer.unobserve(node);
			},
		};
	}

	function intersecting(entries: IntersectionObserverEntry[]): void {
		setTimeout(() => {
			entries.forEach(entry => {
				(entry.target as HTMLElement).dataset['intersecting'] = String(entry.isIntersecting);
				let n = Number((entry.target as HTMLElement).dataset['id']);
				visibility[n] = entry.isIntersecting;
			});
		}, 60);
	}
</script>

{#each items as item (item.id)}
	<div class="item" data-id={item.id} use:observeItem>
		<div style="min-height: {200}px;">
			{@render item_slot(item, visibility[item.id] ? true : false)}
		</div>
	</div>
{/each}
