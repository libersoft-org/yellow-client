<script lang="ts">
	import Code from '@/core/components/Code/Code.svelte';
	import AccountsImportButtons from '@/core/components/Account/AccountsImportButtons.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	let text = $state('');
	let error = $state('');

	function handleError(message: string) {
		error = message;
	}

	$effect(() => {
		if (text) error = '';
	});
</script>

<style>
	.account-import {
		position: relative;
		width: 100%;

		.scrollable {
			overflow: auto;
		}

		.buttons-container {
			margin-top: 10px;
			position: sticky;
			top: 0;
			left: 0;
			z-index: 1;
		}

		.error {
			color: #f00;
			text-align: center;
			margin-top: 10px;
		}
	}
</style>

<div class="account-import">
	<div class="scrollable">
		<Code bind:code={text} />
	</div>
	{#if error}
		<div class="error">{error}</div>
	{/if}
	<div class="buttons-container">
		<AccountsImportButtons importText={text} {close} onError={handleError} />
	</div>
</div>
