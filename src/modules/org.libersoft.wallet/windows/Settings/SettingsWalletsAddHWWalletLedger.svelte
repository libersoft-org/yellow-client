<script lang="ts">
	import { getContext } from 'svelte';
	import Button from '@/core/components/Button/Button.svelte';
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function goBack() {
		setSettingsSection('wallets-add');
	}
</script>

<style>
	.ledger-setup {
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
		text-align: center;
	}

	.placeholder-message {
		padding: 40px 20px;
		border: 2px dashed var(--primary-foreground);
		border-radius: 10px;
		color: var(--primary-foreground);
		margin: 20px 0;
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		margin-top: 30px;
	}
</style>

<div class="ledger-setup">
	<h2>Add Ledger Wallet</h2>
	<div class="placeholder-message">
		<h3>Coming Soon</h3>
		<p>Ledger integration is not yet implemented.</p>
		<p>This feature will be available in a future update.</p>
	</div>
	<div class="buttons">
		<Button onClick={goBack}>Back</Button>
	</div>
</div>
