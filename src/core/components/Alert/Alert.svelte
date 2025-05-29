<script lang="ts" context="module">
	export enum Type {
		SUCCESS = 'success',
		WARNING = 'warning',
		ERROR = 'error',
	}
</script>

<script lang="ts">
	const types = {
		success: {
			color: '#040',
			border: '#080',
			background: '#0F0',
		},
		warning: {
			color: '#440',
			border: '#880',
			background: '#FF0',
		},
		error: {
			color: '#400',
			border: '#800',
			background: '#FBB',
		},
	};

	export let type: Type = Type.ERROR;
	let colors;
	$: colors = types[type] || types[Type.ERROR];
	export let message;
</script>

<style>
	.alert {
		padding: 10px;
		border-radius: 10px;
	}
</style>

{#if message}
	<div class="alert" style:color={colors.color} style:background-color={colors.background} style:border="1px solid {colors.border}">
		{message}
	</div>
{/if}
