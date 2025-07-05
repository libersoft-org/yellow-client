<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		text?: string;
		id?: string;
		row?: boolean;
	}
	let { children, text = $bindable(''), id, row = false }: Props = $props();
</script>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		-webkit-tap-highlight-color: transparent;
		width: 100%;
	}

	label.row {
		flex-direction: row;
		align-items: center;
		gap: 10px;
	}

	.text {
		font-size: 15px;
		padding-left: 5px;
		font-weight: bold;
		cursor: pointer;
	}
</style>

<label class:row>
	{#if text}
		<div class="text">{text}:</div>
	{/if}
	{@render children?.()}
</label>
