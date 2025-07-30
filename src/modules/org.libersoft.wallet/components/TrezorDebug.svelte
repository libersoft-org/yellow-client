<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { isInitialized, initializeTrezor, connectTrezor, getTrezorEthereumAccounts, trezorLoading, trezorError, trezorDevice, trezorState, resetTrezor, type TrezorAccount } from '@/org.libersoft.wallet/scripts/trezor';
</script>

{#if $debug}
	<div class="debug-info">
		<strong>Debug Info:</strong><br />
		trezorLoading: {$trezorLoading}<br />
		trezorError: {$trezorError || 'None'}<br />
		trezorDevice:
		<pre>{JSON.stringify($trezorDevice, null, 2) || 'None'}</pre>
		<br />
		trezorState:
		<pre>{JSON.stringify($trezorState, null, 2) || 'None'}</pre>
		<br />
		SDK isInitialized: {$isInitialized}<br />
	</div>
{/if}
