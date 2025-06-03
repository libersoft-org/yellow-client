<script lang="ts">
	import Clickable from '../Clickable/Clickable.svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		onClick?: (e: Event) => void;
	}

	let { children, onClick }: Props = $props();
</script>

<style>
	.accounts-button {
		display: flex;
		flex: 1;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		padding: 10px;
	}

	.accounts-button:hover {
		background-color: var(--secondary-softer-background);
	}
</style>

<Clickable {onClick}>
	<div class="accounts-button">
		{@render children?.()}
	</div>
</Clickable>
