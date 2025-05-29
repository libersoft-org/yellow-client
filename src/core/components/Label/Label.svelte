<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		text?: string;
		id?: string;
	};

	let { children, text = $bindable('') }: Props = $props();
</script>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		-webkit-tap-highlight-color: transparent;
		max-width: fit-content;
	}

	.text {
		font-size: 15px;
		padding-left: 5px;
		font-weight: bold;
		cursor: pointer;
	}
</style>

<label>
	{#if text}
		<div class="text">{text}:</div>
	{/if}
	{@render children()}
</label>
