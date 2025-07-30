<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import Window from '@/core/components/Window/Window.svelte';
	import { trezorWindow } from '@/org.libersoft.wallet/scripts/trezor.ts';
	import TrezorConnect from '@/org.libersoft.wallet/components/TrezorConnect.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { initializeTrezor } from '@/org.libersoft.wallet/scripts/trezor';
	import Button from '@/core/components/Button/Button.svelte';
	import TrezorDebug from '@/org.libersoft.wallet/components/TrezorDebug.svelte';

	let elWindow: Window | undefined = $state();

	onMount(async () => {
		trezorWindow.set(elWindow);
		if ($debug) {
			//await elWindow.open();
		}
	});

	onDestroy(() => {
		trezorWindow.set(undefined);
	});

	export async function open() {
		await initializeTrezor();
	}
</script>

<style>
	.trezor-setup {
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
	}
</style>

<Window title="Trezor" width="600px" height="500px" testId="trezor-window" bind:this={elWindow}>
	<div class="trezor-setup">
		<TrezorConnect />
		<Button img="img/cancel.svg" text="Close" onClick={elWindow?.close} style="margin-top: 20px;" testId="close-trezor-window-btn" />
	</div>
</Window>

<TrezorDebug />
