<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLSelectAttributes {
		value: string | number;
		grow?: boolean;
		minWidth?: string;
		maxWidth?: string;
		children?: Snippet;
		label?: any;
	}

	let { value = $bindable(''), grow = false, minWidth, maxWidth, children, label, ...restProps }: Props = $props();

	let selectRef: HTMLSelectElement;

	export function focus() {
		selectRef?.focus();
	}
</script>

<style>
	select {
		box-sizing: content-box;
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

	.select {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>

{#snippet select()}
	<select {...restProps} style:flex-grow={grow ? '1' : undefined} style:max-width={maxWidth && 'calc(' + maxWidth + ' - 32px)'} style:min-width={minWidth && 'calc(' + minWidth + ' - 32px)'} bind:this={selectRef} bind:value>
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
