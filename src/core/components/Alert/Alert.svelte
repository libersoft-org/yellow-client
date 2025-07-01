<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		type?: 'info' | 'warning' | 'error';
		message?: string;
		testId?: string;
	}
	let { children, type = 'error', message, testId }: Props = $props();
	const types = {
		info: { label: 'Info', color: '#040', border: '#080', background: '#8f8' },
		warning: { label: 'Warning', color: '#440', border: '#880', background: '#ff0' },
		error: { label: 'Error', color: '#400', border: '#800', background: '#fbb' },
	} as const;
	let colors = $derived(() => types[type] || types.error);
</script>

<style>
	.alert {
		display: flex;
		gap: 5px;
		padding: 10px;
		border-radius: 10px;
	}
</style>

<div class="alert" style:color={colors().color} style:background-color={colors().background} style:border="1px solid {colors().border}" data-testid={testId}>
	{#if children}
		{@render children?.()}
	{/if}
	{#if message}
		<div class="bold">{colors().label}:</div>
		<div>{message}</div>
	{/if}
</div>
