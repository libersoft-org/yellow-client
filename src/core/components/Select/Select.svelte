<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import Icon from '@/core/components/Icon/Icon.svelte';
	interface Props extends HTMLSelectAttributes {
		value: string | number;
		expand?: boolean;
		minWidth?: string;
		maxWidth?: string;
		children?: Snippet;
		label?: any;
		enabled?: boolean;
	}
	let { enabled = true, value = $bindable(''), expand = false, minWidth, maxWidth, children, label, ...restProps }: Props = $props();
	let selectRef: HTMLSelectElement;

	export function focus() {
		selectRef?.focus();
	}
</script>

<style>
	.select-container {
		position: relative;
		display: inline-block;
	}

	select {
		box-sizing: border-box;
		-webkit-appearance: none;
		appearance: none;
		padding: 10px 30px 10px 10px; /* Increased right padding for icon */
		font-family: inherit;
		font-size: inherit;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		background-color: var(--default-background);
		color: var(--default-foreground);
		cursor: pointer;
		width: 100%;
	}

	select:focus {
		outline: 2px solid var(--primary-harder-background);
	}

	select.expand {
		width: 100%;
	}

	.select-container :global(.icon) {
		position: absolute;
		right: 8px;
		top: 50%;
		width: 12px;
		transform: translateY(-50%);
		pointer-events: none; /* So clicks pass through to select */
	}

	.select {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.disabled {
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		cursor: not-allowed;
	}
</style>

{#snippet select()}
	<div class="select-container">
		<select disabled={!enabled} {...restProps} class:disabled={!enabled} class:expand style:max-width={maxWidth && maxWidth} style:min-width={minWidth && minWidth} bind:this={selectRef} bind:value>
			{@render children?.()}
		</select>
		<Icon img="img/down.svg" colorVariable="--default-foreground" alt="Dropdown" size="12px" padding="0px" />
	</div>
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
