<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { getContext } from 'svelte';
	import { addHardwareWallet } from 'libersoft-crypto/wallet';
	import { ledgerLoading, ledgerDevice, ledgerError, ledgerConnected, getLedgerDeviceIdentifiers } from 'libersoft-crypto/ledger';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import LedgerConnect from '@/org.libersoft.wallet/components/LedgerConnect.svelte';

	const setSettingsSection = getContext<Function>('setSettingsSection');
	let walletName = $state('');
	let step = $state<'connect' | 'configure'>('connect');

	// Pre-fill wallet name when device connects
	$effect(() => {
		if ($ledgerDevice && !walletName) {
			walletName = $ledgerDevice?.name || 'Ledger Wallet';
		}
	});

	let nextText = $derived.by(() => {
		return step === 'connect' ? 'Next' : 'Add Wallet';
	});

	let nextEenabled = $derived.by(() => {
		return step === 'connect' ? $ledgerConnected : !!walletName.trim() && $ledgerConnected;
	});

	function onNext() {
		if (step === 'connect') {
			step = 'configure';
		} else if (step === 'configure') {
			addWallet();
		}
	}

	async function addWallet() {
		// Get device identifiers similar to how Trezor uses staticSessionId
		const deviceIdentifiers = getLedgerDeviceIdentifiers();

		// Add hardware wallet representing the whole device, not a specific address
		const w = await addHardwareWallet('ledger', walletName, deviceIdentifiers);
		setSettingsSection('wallets');
	}

	function goBack() {
		if (step === 'configure') {
			step = 'connect';
		} else {
			setSettingsSection('wallets-add');
		}
	}
</script>

<style>
	.ledger-setup {
		max-width: 800px;
	}

	.form-section {
		margin: 20px 0;
	}

	.buttons {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		margin-top: 30px;
	}

	.loading {
		display: flex;
		align-items: center;
		gap: 10px;
		justify-content: center;
		padding: 20px;
	}
</style>

{#if step === 'connect'}
	<LedgerConnect />
{:else if step === 'configure'}
	{#if $ledgerLoading}
		<div class="loading">
			<span>Loading device information...</span>
		</div>
	{:else}
		<h3>Configure Wallet</h3>
		<p>Your Ledger device is ready. Give your wallet a name:</p>

		<div class="form-section">
			<Label text="Wallet Name">
				<Input bind:value={walletName} placeholder="Enter wallet name" />
			</Label>
		</div>
	{/if}
{/if}

<div class="buttons">
	<Button text="Back" onClick={goBack} />
	<Button text={nextText} onClick={onNext} enabled={nextEenabled} />
</div>
