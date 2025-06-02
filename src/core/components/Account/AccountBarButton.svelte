<script lang="ts">
	import BaseButton from '../BaseButton/BaseButton.svelte';
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

<BaseButton {onClick}>
	<div class="accounts-button">
		{@render children?.()}
	</div>
</BaseButton>
