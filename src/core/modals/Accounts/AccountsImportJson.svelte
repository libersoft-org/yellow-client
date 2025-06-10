<script lang="ts">
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Code from '@/core/components/Code/Code.svelte';
	import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import AccountsImportButtons from '@/core/components/Account/AccountsImportButtons.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	let text = $state('');
	let error = $state('');
	let fileInput: HTMLInputElement;

	function handleError(message: string) {
		error = message;
	}

	function loadFile() {
		fileInput.click();
	}

	function handleFileSelect(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = e => {
				text = (e.target?.result as string) || '';
			};
			reader.readAsText(file);
		}
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
	<ButtonBar>
		<Button onclick={loadFile}>Open JSON file</Button>
	</ButtonBar>
	{#if error}
		<Alert type="error" message={error} />
	{/if}
	<div class="scrollable">
		<Code bind:code={text} />
	</div>
	<input bind:this={fileInput} type="file" accept=".json,application/json" style="display: none;" onchange={handleFileSelect} />
	<AccountsImportButtons importText={text} {close} onError={handleError} />
</div>
