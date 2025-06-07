<script lang="ts">
	const types = {
		success: {
			label: 'Info',
			color: '#040',
			border: '#080',
			background: '#0F0',
		},
		warning: {
			label: 'Warning',
			color: '#440',
			border: '#880',
			background: '#FF0',
		},
		error: {
			label: 'Error',
			color: '#400',
			border: '#800',
			background: '#FBB',
		},
	} as const;

	export let type: 'success' | 'warning' | 'error' = 'error';
	export let message: string | undefined;
	let colors;
	$: colors = types[type] || types.error;
</script>

<style>
	.alert {
		display: flex;
		gap: 5px;
		padding: 10px;
		border-radius: 10px;
	}
</style>

{#if message}
	<div class="alert" style:color={colors.color} style:background-color={colors.background} style:border="1px solid {colors.border}">
		<div class="bold">{colors.label}:</div>
		<div>{message}</div>
	</div>
{/if}
