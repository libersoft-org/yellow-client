<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import Window from '@/core/components/Window/Window.svelte';
	import { ledgerWindow } from '@/org.libersoft.wallet/scripts/ledger-window.ts';
	import LedgerConnect from '@/org.libersoft.wallet/components/LedgerConnect.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { initializeLedger } from '@/org.libersoft.wallet/scripts/ledger';
	import Button from '@/core/components/Button/Button.svelte';

	let elWindow: Window | undefined = $state();

	onMount(async () => {
		ledgerWindow.set(elWindow || null);
		if ($debug) {
			//await elWindow.open();
		}
	});

	onDestroy(() => {
		ledgerWindow.set(null);
	});

	export async function open() {
		await initializeLedger();
	}
</script>

<style>
	.ledger-setup {
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
	}
</style>

<Window title="Ledger" width="600px" height="600px" testId="ledger-window" bind:this={elWindow}>
	<div class="ledger-setup">
		<LedgerConnect />
		<Button img="img/cancel.svg" text="Close" onClick={elWindow?.close} style="margin-top: 20px;" data-testid="close-ledger-window-btn" />
	</div>
</Window>
