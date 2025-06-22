<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	interface Props extends HTMLSelectAttributes {
		value: string | number;
		expand?: boolean;
		minWidth?: string;
		maxWidth?: string;
		children?: Snippet;
		label?: any;
	}
	let { value = $bindable(''), expand = false, minWidth, maxWidth, children, label, ...restProps }: Props = $props();
	let selectRef: HTMLSelectElement;

	export function focus() {
		selectRef?.focus();
	}
</script>

<style>
	select {
		box-sizing: border-box;
		-webkit-appearance: none;
		appearance: none;
		padding: 10px 20px 10px 10px;
		font-family: inherit;
		font-size: inherit;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		background: url('/img/down.svg') no-repeat;
		background-size: 12px 12px;
		background-position: right 5px center;
		background-color: var(--default-background);
		color: var(--default-foreground);
		cursor: pointer;
	}

	select:focus {
		outline: 2px solid var(--primary-harder-background);
	}

	select.expand {
		width: 100%;
	}

	.select {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>

{#snippet select()}
	<select {...restProps} class:expand style:max-width={maxWidth && maxWidth} style:min-width={minWidth && minWidth} bind:this={selectRef} bind:value>
		{@render children?.()}
	</select>
{/snippet}

<div class="select">
	{#if label}
		<label for={label}>
			{label}
		</label>
		{@render select()}
	{:else}
		{@render select()}
	{/if}
</div>
