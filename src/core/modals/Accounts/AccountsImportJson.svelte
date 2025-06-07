<script lang="ts">
	import Alert from '@/core/components/Alert/Alert.svelte';
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
		display: flex;
		flex-direction: column;
		gap: 10px;

		.scrollable {
			overflow: auto;
		}
	}
</style>

<div class="account-import">
	{#if error}
		<Alert type="warning" message={error} />
	{/if}
	<div class="scrollable">
		<Code bind:code={text} />
	</div>
	<AccountsImportButtons importText={text} {close} onError={handleError} />
</div>
