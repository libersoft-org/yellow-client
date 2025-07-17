<script lang="ts">
	import { getContext } from 'svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	const setSettingsSection = getContext<Function>('setSettingsSection');

	function clickTrezor() {
		setSettingsSection('wallets-add-hw-trezor');
	}

	function clickLedger() {
		setSettingsSection('wallets-add-hw-ledger');
	}
</script>

<style>
	.hw-wallets {
		display: flex;
		gap: 10px;
		width: 100%;
	}

	.hw-wallets :global(.clickable) {
		flex: 1;
	}

	.box {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 10px;
		border: 1px solid var(--primary-foreground);
		border-radius: 10px;
		font-size: 25px;
		font-weight: bold;
		aspect-ratio: 1;
		box-sizing: border-box;
		background-color: var(--primary-softer-background);
		transition: background-color 0.4s linear;
	}

	.box:hover {
		background-color: var(--primary-background);
	}
</style>

<div class="hw-wallets">
	<Clickable onClick={clickTrezor}>
		<div class="box">
			<Icon img="modules/{module.identifier}/img/wallet-trezor.svg" size="60px" />
			<div>Trezor</div>
		</div>
	</Clickable>
	<Clickable onClick={clickLedger}>
		<div class="box">
			<Icon img="modules/{module.identifier}/img/wallet-ledger.svg" size="60px" />
			<div>Ledger</div>
		</div>
	</Clickable>
</div>
