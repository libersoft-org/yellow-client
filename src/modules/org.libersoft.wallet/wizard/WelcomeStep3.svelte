<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { get } from 'svelte/store';
	import Button from '@/core/components/Button/Button.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { wallets } from 'libersoft-crypto/wallet';
	import { settingsWindow } from '@/org.libersoft.wallet/scripts/ui';
	import { module } from '@/org.libersoft.wallet/scripts/module';

	const wizard = getContext('wizard') as { setNextText: (text: string) => void };
	let hasWallets = $state(false);

	onMount(() => {
		checkWallets();
		const unsubscribe = wallets.subscribe(() => {
			checkWallets();
		});

		return unsubscribe;
	});

	function checkWallets() {
		hasWallets = get(wallets).length > 0;
		if (hasWallets) {
			wizard?.setNextText('Next');
		} else {
			wizard?.setNextText('Skip for now');
		}
	}

	function openWalletSettings() {
		const settings = get(settingsWindow);
		if (settings) {
			settings.open();
			settings.setSettingsSection('wallets-add');
		}
	}
</script>

<style>
	.content {
		text-align: center;
	}

	.title {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.description {
		margin-bottom: 30px;
		line-height: 1.5;
		color: var(--secondary-foreground);
	}

	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 20px;
		border-radius: 8px;
		margin: 20px 0;
	}

	.status.success {
		background-color: var(--success-softer-background);
		border: 1px solid var(--success-harder-background);
		color: var(--success-foreground);
	}

	.status.warning {
		background-color: var(--warning-softer-background);
		border: 1px solid var(--warning-harder-background);
		color: var(--warning-foreground);
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.wallet-options {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>

<div class="content">
	<div class="title">Create Your First Wallet</div>
	<div class="description">Wallets store your private keys and allow you to send and receive cryptocurrency. You can create a software wallet or connect a hardware wallet.</div>

	{#if hasWallets}
		<div class="status success">
			<Icon img="img/check.svg" size="20px" />
			Great! You have {get(wallets).length} wallet(s) configured.
		</div>
	{:else}
		<div class="status warning">
			<Icon img="img/warning.svg" size="20px" />
			No wallets found. Create one to start managing your cryptocurrency.
		</div>
		<div class="actions">
			<div class="wallet-options">
				<Button img="modules/{module.identifier}/img/wallet.svg" text="Create Software Wallet" onClick={openWalletSettings} data-testid="create-wallet" />
			</div>
			<div style="font-size: 12px; color: var(--secondary-foreground);">You can also connect hardware wallets (Trezor, Ledger) in the settings later</div>
		</div>
	{/if}
</div>
