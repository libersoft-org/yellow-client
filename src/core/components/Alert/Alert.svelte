<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		type?: 'success' | 'warning' | 'error';
		message?: string;
	}
	let { children, type = 'error', message }: Props = $props();
	const types = {
		success: { label: 'Info', color: '#040', border: '#080', background: '#0F0' },
		warning: { label: 'Warning', color: '#440', border: '#880', background: '#FF0' },
		error: { label: 'Error', color: '#400', border: '#800', background: '#FBB' },
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

<div class="alert" style:color={colors().color} style:background-color={colors().background} style:border="1px solid {colors().border}">
	{#if children}
		{@render children?.()}
	{/if}
	{#if message}
		<div class="bold">{colors().label}:</div>
		<div>{message}</div>
	{/if}
</div>
